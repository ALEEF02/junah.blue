import Beat from '../models/Beat.js';
import ContractTemplate from '../models/ContractTemplate.js';
import SignedAgreement from '../models/SignedAgreement.js';
import Order from '../models/Order.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { env } from '../config/env.js';
import {
  getStripeCharge,
  getStripePaymentIntent,
  verifyStripeEvent
} from '../services/stripeService.js';
import { createPrintifyOrder } from '../services/printifyService.js';
import { buildAgreementPdfBuffer } from '../utils/pdfAgreement.js';
import {
  uploadContractBuffer,
  getBeatSignedReadUrl,
  getContractSignedReadUrl
} from '../services/s3Service.js';
import { sendBeatDeliveryEmail, sendSellerAgreementCopyEmail } from '../services/emailService.js';
import {
  agreementStateFromOrderState,
  orderPaymentStatusFromStripeState,
  orderStateFromCharge,
  orderStateFromDisputeStatus,
  shouldManualReviewOrder
} from '../services/paymentStateService.js';

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

const pickId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.id) return String(value.id);
  return '';
};

const loadPaymentIntent = async (paymentIntentRef) => {
  if (!paymentIntentRef) return null;
  if (typeof paymentIntentRef === 'object') return paymentIntentRef;

  return getStripePaymentIntent(paymentIntentRef, ['latest_charge']).catch(() => null);
};

const loadCharge = async (chargeRef) => {
  if (!chargeRef) return null;
  if (typeof chargeRef === 'object') return chargeRef;
  return getStripeCharge(chargeRef).catch(() => null);
};

const resolvePaymentArtifacts = async ({ paymentIntentRef }) => {
  const paymentIntent = await loadPaymentIntent(paymentIntentRef);
  const paymentIntentId = pickId(paymentIntentRef) || pickId(paymentIntent?.id);

  const chargeRef = paymentIntent?.latest_charge;
  const charge = await loadCharge(chargeRef);
  const chargeId = pickId(chargeRef) || pickId(charge?.id);

  return {
    paymentIntentId,
    chargeId,
    paymentIntent,
    charge
  };
};

const updateAgreementPaymentState = async ({
  agreement,
  order,
  explicitAgreementState,
  explicitOrderState,
  paymentIntentId,
  chargeId
}) => {
  if (!agreement) return;

  const stripeState = explicitOrderState || order?.stripePaymentState || 'pending';

  agreement.orderId = order?._id || agreement.orderId || null;
  agreement.stripeCheckoutSessionId = order?.stripeCheckoutSessionId || agreement.stripeCheckoutSessionId || '';
  agreement.stripePaymentIntentId = paymentIntentId || order?.stripePaymentIntentId || agreement.stripePaymentIntentId || '';
  agreement.stripeChargeId = chargeId || order?.stripeChargeId || agreement.stripeChargeId || '';
  agreement.paymentState = explicitAgreementState || agreementStateFromOrderState(stripeState);
  agreement.paymentStateUpdatedAt = new Date();
  agreement.needsManualReview = Boolean(order?.needsManualReview || agreement.needsManualReview);

  await agreement.save();
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

  const [beat, agreement, artifacts] = await Promise.all([
    Beat.findById(beatId),
    SignedAgreement.findById(agreementId),
    resolvePaymentArtifacts({ paymentIntentRef: session.payment_intent })
  ]);

  if (!beat || !agreement) {
    throw new Error('Beat or agreement record missing for webhook fulfillment');
  }

  const order = await Order.create({
    type: 'beat',
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: artifacts.paymentIntentId || '',
    stripeChargeId: artifacts.chargeId || '',
    stripeDisputeId: '',
    stripeDisputeStatus: '',
    stripePaymentState: 'paid',
    amountRefunded: 0,
    stripeLivemode: Boolean(session.livemode),
    lastStripeSyncAt: new Date(),
    needsManualReview: false,
    buyerEmail: agreement.buyerEmail,
    buyerName: agreement.buyerName,
    beatId: beat._id,
    agreementId: agreement._id,
    licenseType: licenseType || agreement.templateType,
    amountSubtotal: session.amount_subtotal || 0,
    amountTax: session.total_details?.amount_tax || 0,
    amountTotal: session.amount_total || 0,
    currency: session.currency || 'usd',
    paymentStatus: orderPaymentStatusFromStripeState('paid'),
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

  agreement.agreementPdfKey = pdfKey;
  await updateAgreementPaymentState({
    agreement,
    order,
    explicitOrderState: 'paid',
    explicitAgreementState: 'paid',
    paymentIntentId: artifacts.paymentIntentId,
    chargeId: artifacts.chargeId
  });

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

  const [items, artifacts] = await Promise.all([
    Promise.resolve(parseApparelItems(session.metadata?.items)),
    resolvePaymentArtifacts({ paymentIntentRef: session.payment_intent })
  ]);

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
    stripePaymentIntentId: artifacts.paymentIntentId || '',
    stripeChargeId: artifacts.chargeId || '',
    stripeDisputeId: '',
    stripeDisputeStatus: '',
    stripePaymentState: 'paid',
    amountRefunded: 0,
    stripeLivemode: Boolean(session.livemode),
    lastStripeSyncAt: new Date(),
    needsManualReview: false,
    buyerEmail: session.customer_details?.email || session.customer_email || '',
    buyerName: session.customer_details?.name || '',
    amountSubtotal: session.amount_subtotal || 0,
    amountTax: session.total_details?.amount_tax || 0,
    amountTotal: session.amount_total || 0,
    currency: session.currency || 'usd',
    paymentStatus: orderPaymentStatusFromStripeState('paid'),
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

const applyOrderLifecycleState = async ({
  order,
  stripeState,
  paymentIntentId,
  chargeId,
  disputeId,
  disputeStatus,
  amountRefunded,
  livemode
}) => {
  if (!order) return null;

  order.stripePaymentState = stripeState;
  order.paymentStatus = orderPaymentStatusFromStripeState(stripeState);
  if (paymentIntentId !== undefined) order.stripePaymentIntentId = paymentIntentId || '';
  if (chargeId !== undefined) order.stripeChargeId = chargeId || '';
  if (disputeId !== undefined) order.stripeDisputeId = disputeId || '';
  if (disputeStatus !== undefined) order.stripeDisputeStatus = disputeStatus || '';
  if (typeof amountRefunded === 'number') order.amountRefunded = amountRefunded;
  if (typeof livemode === 'boolean') order.stripeLivemode = livemode;
  order.needsManualReview = shouldManualReviewOrder(order, stripeState);
  order.lastStripeSyncAt = new Date();
  await order.save();

  return order;
};

const handleCheckoutSessionExpired = async (session) => {
  const order = await Order.findOne({ stripeCheckoutSessionId: session.id });
  const paymentIntentId = pickId(session.payment_intent);

  if (order) {
    await applyOrderLifecycleState({
      order,
      stripeState: 'canceled',
      paymentIntentId,
      livemode: session.livemode
    });
    const agreement = order.agreementId ? await SignedAgreement.findById(order.agreementId) : null;
    await updateAgreementPaymentState({
      agreement,
      order,
      explicitOrderState: 'canceled',
      explicitAgreementState: 'expired',
      paymentIntentId
    });
    return;
  }

  const agreement = await SignedAgreement.findOne({ stripeCheckoutSessionId: session.id });
  await updateAgreementPaymentState({
    agreement,
    explicitOrderState: 'canceled',
    explicitAgreementState: 'expired',
    paymentIntentId
  });
};

const handleCheckoutSessionAsyncPaymentFailed = async (session) => {
  const order = await Order.findOne({ stripeCheckoutSessionId: session.id });
  const paymentIntentId = pickId(session.payment_intent);

  if (order) {
    await applyOrderLifecycleState({
      order,
      stripeState: 'failed',
      paymentIntentId,
      livemode: session.livemode
    });
    const agreement = order.agreementId ? await SignedAgreement.findById(order.agreementId) : null;
    await updateAgreementPaymentState({
      agreement,
      order,
      explicitOrderState: 'failed',
      explicitAgreementState: 'failed',
      paymentIntentId
    });
    return;
  }

  const agreement = await SignedAgreement.findOne({ stripeCheckoutSessionId: session.id });
  await updateAgreementPaymentState({
    agreement,
    explicitOrderState: 'failed',
    explicitAgreementState: 'failed',
    paymentIntentId
  });
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  const paymentIntentId = pickId(paymentIntent.id);
  const chargeId = pickId(paymentIntent.latest_charge);
  const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
  if (!order) {
    const agreement = await SignedAgreement.findOne({ stripePaymentIntentId: paymentIntentId });
    await updateAgreementPaymentState({
      agreement,
      explicitOrderState: 'failed',
      explicitAgreementState: 'failed',
      paymentIntentId,
      chargeId
    });
    return;
  }

  await applyOrderLifecycleState({
    order,
    stripeState: 'failed',
    paymentIntentId,
    chargeId
  });

  const agreement = order.agreementId ? await SignedAgreement.findById(order.agreementId) : null;
  await updateAgreementPaymentState({
    agreement,
    order,
    explicitOrderState: 'failed',
    explicitAgreementState: 'failed',
    paymentIntentId,
    chargeId
  });
};

const handlePaymentIntentCanceled = async (paymentIntent) => {
  const paymentIntentId = pickId(paymentIntent.id);
  const chargeId = pickId(paymentIntent.latest_charge);
  const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
  if (!order) {
    const agreement = await SignedAgreement.findOne({ stripePaymentIntentId: paymentIntentId });
    await updateAgreementPaymentState({
      agreement,
      explicitOrderState: 'canceled',
      explicitAgreementState: 'canceled',
      paymentIntentId,
      chargeId
    });
    return;
  }

  await applyOrderLifecycleState({
    order,
    stripeState: 'canceled',
    paymentIntentId,
    chargeId
  });

  const agreement = order.agreementId ? await SignedAgreement.findById(order.agreementId) : null;
  await updateAgreementPaymentState({
    agreement,
    order,
    explicitOrderState: 'canceled',
    explicitAgreementState: 'canceled',
    paymentIntentId,
    chargeId
  });
};

const handleChargeRefunded = async (charge) => {
  const chargeId = pickId(charge.id);
  const paymentIntentId = pickId(charge.payment_intent);

  const order =
    (chargeId ? await Order.findOne({ stripeChargeId: chargeId }) : null) ||
    (paymentIntentId ? await Order.findOne({ stripePaymentIntentId: paymentIntentId }) : null);

  if (!order) return;

  const stripeState = orderStateFromCharge({
    charge,
    paymentIntentStatus: 'succeeded'
  });

  await applyOrderLifecycleState({
    order,
    stripeState,
    paymentIntentId,
    chargeId,
    amountRefunded: Number(charge.amount_refunded || 0),
    livemode: charge.livemode
  });

  const agreement = order.agreementId ? await SignedAgreement.findById(order.agreementId) : null;
  await updateAgreementPaymentState({
    agreement,
    order,
    explicitOrderState: stripeState,
    explicitAgreementState: agreementStateFromOrderState(stripeState),
    paymentIntentId,
    chargeId
  });
};

const handleChargeDispute = async (dispute) => {
  const disputeId = pickId(dispute.id);
  const chargeId = pickId(dispute.charge);
  const charge = chargeId ? await getStripeCharge(chargeId).catch(() => null) : null;
  const paymentIntentId = pickId(charge?.payment_intent);

  const order =
    (chargeId ? await Order.findOne({ stripeChargeId: chargeId }) : null) ||
    (paymentIntentId ? await Order.findOne({ stripePaymentIntentId: paymentIntentId }) : null);
  if (!order) return;

  const stripeState = orderStateFromDisputeStatus(dispute.status);

  await applyOrderLifecycleState({
    order,
    stripeState,
    paymentIntentId,
    chargeId,
    disputeId,
    disputeStatus: dispute.status
  });

  const agreement = order.agreementId ? await SignedAgreement.findById(order.agreementId) : null;
  await updateAgreementPaymentState({
    agreement,
    order,
    explicitOrderState: stripeState,
    explicitAgreementState: agreementStateFromOrderState(stripeState),
    paymentIntentId,
    chargeId
  });
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
    } else if (event.type === 'checkout.session.expired') {
      await handleCheckoutSessionExpired(event.data.object);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      await handleCheckoutSessionAsyncPaymentFailed(event.data.object);
    } else if (event.type === 'payment_intent.payment_failed') {
      await handlePaymentIntentFailed(event.data.object);
    } else if (event.type === 'payment_intent.canceled') {
      await handlePaymentIntentCanceled(event.data.object);
    } else if (event.type === 'charge.refunded') {
      await handleChargeRefunded(event.data.object);
    } else if (
      event.type === 'charge.dispute.created' ||
      event.type === 'charge.dispute.updated' ||
      event.type === 'charge.dispute.closed'
    ) {
      await handleChargeDispute(event.data.object);
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
