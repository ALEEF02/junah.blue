import Beat from '../models/Beat.js';
import ContractTemplate from '../models/ContractTemplate.js';
import SignedAgreement from '../models/SignedAgreement.js';
import Order from '../models/Order.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { env } from '../config/env.js';
import { verifyStripeEvent } from '../services/stripeService.js';
import { createPrintifyOrder } from '../services/printifyService.js';
import { buildAgreementPdfBuffer } from '../utils/pdfAgreement.js';
import {
  uploadContractBuffer,
  getBeatSignedReadUrl,
  getContractSignedReadUrl
} from '../services/s3Service.js';
import { sendBeatDeliveryEmail, sendSellerAgreementCopyEmail } from '../services/emailService.js';

const parseApparelItems = (raw) => {
  if (!raw) return [];

  try {
    const json = Buffer.from(raw, 'base64').toString('utf-8');
    const items = JSON.parse(json);
    return Array.isArray(items) ? items : [];
  } catch (_err) {
    return [];
  }
};

const handleBeatCheckoutCompleted = async (session) => {
  const { beatId, agreementId, licenseType } = session.metadata || {};

  if (!beatId || !agreementId) {
    throw new Error('Missing beat checkout metadata');
  }

  const existingOrder = await Order.findOne({ stripeCheckoutSessionId: session.id });
  if (existingOrder) {
    return;
  }

  const [beat, agreement] = await Promise.all([Beat.findById(beatId), SignedAgreement.findById(agreementId)]);

  if (!beat || !agreement) {
    throw new Error('Beat or agreement record missing for webhook fulfillment');
  }

  const order = await Order.create({
    type: 'beat',
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: session.payment_intent || '',
    buyerEmail: agreement.buyerEmail,
    buyerName: agreement.buyerName,
    beatId: beat._id,
    agreementId: agreement._id,
    licenseType: licenseType || agreement.templateType,
    amountSubtotal: session.amount_subtotal || 0,
    amountTax: session.total_details?.amount_tax || 0,
    amountTotal: session.amount_total || 0,
    currency: session.currency || 'usd',
    paymentStatus: 'paid',
    fulfillmentStatus: 'pending',
    lineItems: [
      {
        label: `${beat.title} - ${agreement.templateType}`,
        quantity: 1,
        amountCents: session.amount_subtotal || 0,
        metadata: {
          beatId: String(beat._id),
          agreementId: String(agreement._id)
        }
      }
    ]
  });

  if (agreement.templateType === 'exclusive') {
    beat.isAvailable = false;
    await beat.save();
  }

  const template = await ContractTemplate.findById(agreement.templateId);
  if (!template) {
    throw new Error('Missing contract template during webhook fulfillment');
  }

  const pdfBuffer = await buildAgreementPdfBuffer({ agreement, beat, template });
  const pdfKey = `agreements/${order._id}.pdf`;

  await uploadContractBuffer({
    key: pdfKey,
    buffer: pdfBuffer,
    contentType: 'application/pdf'
  });

  agreement.orderId = order._id;
  agreement.agreementPdfKey = pdfKey;
  await agreement.save();

  const [downloadUrl, agreementUrl] = await Promise.all([
    beat.fullFileKey ? getBeatSignedReadUrl(beat.fullFileKey, 60 * 60 * 24 * 7) : Promise.resolve(''),
    getContractSignedReadUrl(pdfKey, 60 * 60 * 24 * 7)
  ]);

  if (downloadUrl) {
    await sendBeatDeliveryEmail({
      to: agreement.buyerEmail,
      beatTitle: beat.title,
      downloadUrl,
      agreementUrl
    });
  }

  await sendSellerAgreementCopyEmail({
    to: env.OWNER_EMAIL,
    buyerEmail: agreement.buyerEmail,
    beatTitle: beat.title,
    agreementUrl
  });

  order.fulfillmentStatus = 'fulfilled';
  await order.save();
};

const handleApparelCheckoutCompleted = async (session) => {
  const existingOrder = await Order.findOne({ stripeCheckoutSessionId: session.id });
  if (existingOrder) return;

  const items = parseApparelItems(session.metadata?.items);

  const lineItems = items.map((item) => ({
    label: item.label || `${item.productId} - ${item.variantId}`,
    quantity: Number(item.quantity),
    amountCents: Number(item.amountCents),
    metadata: {
      productId: item.productId,
      variantId: item.variantId
    }
  }));

  const order = await Order.create({
    type: 'apparel',
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: session.payment_intent || '',
    buyerEmail: session.customer_details?.email || session.customer_email || '',
    buyerName: session.customer_details?.name || '',
    amountSubtotal: session.amount_subtotal || 0,
    amountTax: session.total_details?.amount_tax || 0,
    amountTotal: session.amount_total || 0,
    currency: session.currency || 'usd',
    paymentStatus: 'paid',
    fulfillmentStatus: 'pending',
    lineItems
  });

  if (!session.livemode) {
    order.fulfillmentStatus = 'not-applicable';
    await order.save();
    return;
  }

  try {
    const printifyOrder = await createPrintifyOrder({
      sessionId: session.id,
      customer: {
        email: session.customer_details?.email || session.customer_email || '',
        name: session.customer_details?.name || '',
        address: session.customer_details?.address || null
      },
      items
    });

    order.printifyOrderId = printifyOrder?.id ? String(printifyOrder.id) : '';
    order.fulfillmentStatus = 'fulfilled';
    await order.save();
  } catch (error) {
    order.fulfillmentStatus = 'failed';
    await order.save();
    console.error('Printify fulfillment failed:', error.message, error.response ? '\n\t' : '', error.response?.data);
  }
};

export const handleStripeWebhook = async (req, res) => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe signature header' });
  }

  let event;

  try {
    event = verifyStripeEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).json({ error: `Invalid webhook signature: ${error.message}` });
  }

  const processed = await WebhookEvent.findOne({ eventId: event.id });
  if (processed) {
    return res.status(200).json({ received: true, deduplicated: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderType = session.metadata?.orderType;

      if (orderType === 'beat') {
        await handleBeatCheckoutCompleted(session);
      } else if (orderType === 'apparel') {
        await handleApparelCheckoutCompleted(session);
      }
    }

    await WebhookEvent.create({
      provider: 'stripe',
      eventId: event.id,
      eventType: event.type,
      processedAt: new Date()
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
