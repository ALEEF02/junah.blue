import Order from '../models/Order.js';
import SignedAgreement from '../models/SignedAgreement.js';
import { hasStripeConfigured } from '../config/env.js';
import {
  getStripeCharge,
  getStripeCheckoutSession,
  getStripeDispute,
  getStripePaymentIntent
} from './stripeService.js';
import {
  agreementStateFromOrderState,
  orderPaymentStatusFromStripeState,
  orderStateFromCharge,
  orderStateFromDisputeStatus,
  orderStateFromPaymentIntentStatus,
  shouldManualReviewOrder
} from './paymentStateService.js';

const SYNC_COOLDOWN_MS = 60 * 1000;
let lastSyncAt = 0;
let activeSyncPromise = null;

const pickId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.id) return String(value.id);
  return '';
};

const resolvePaymentArtifacts = async (session) => {
  const paymentIntentRef = session?.payment_intent;
  let paymentIntent = null;
  let charge = null;
  let dispute = null;

  const paymentIntentId = pickId(paymentIntentRef);

  if (paymentIntentRef && typeof paymentIntentRef === 'object') {
    paymentIntent = paymentIntentRef;
  } else if (paymentIntentId) {
    paymentIntent = await getStripePaymentIntent(paymentIntentId, ['latest_charge']).catch(() => null);
  }

  const chargeRef = paymentIntent?.latest_charge;
  const chargeId = pickId(chargeRef);

  if (chargeRef && typeof chargeRef === 'object') {
    charge = chargeRef;
  } else if (chargeId) {
    charge = await getStripeCharge(chargeId).catch(() => null);
  }

  const disputeRef = charge?.dispute;
  const disputeId = pickId(disputeRef);
  if (disputeRef && typeof disputeRef === 'object') {
    dispute = disputeRef;
  } else if (disputeId) {
    dispute = await getStripeDispute(disputeId).catch(() => null);
  }

  return {
    paymentIntentId,
    paymentIntent,
    chargeId,
    charge,
    disputeId,
    dispute
  };
};

const deriveStripeState = ({ session, paymentIntent, charge, dispute }) => {
  if (dispute) {
    return orderStateFromDisputeStatus(dispute.status);
  }

  if (charge) {
    return orderStateFromCharge({
      charge,
      paymentIntentStatus: paymentIntent?.status
    });
  }

  if (session?.status === 'expired') return 'canceled';
  if (session?.payment_status === 'paid') return 'paid';

  return orderStateFromPaymentIntentStatus(paymentIntent?.status);
};

const syncAgreementForOrder = async ({ order, stripeState }) => {
  if (!order.agreementId && !order.stripeCheckoutSessionId) return;

  const agreement =
    (order.agreementId ? await SignedAgreement.findById(order.agreementId) : null) ||
    (order.stripeCheckoutSessionId
      ? await SignedAgreement.findOne({ stripeCheckoutSessionId: order.stripeCheckoutSessionId })
      : null);

  if (!agreement) return;

  agreement.orderId = order._id;
  agreement.stripeCheckoutSessionId = order.stripeCheckoutSessionId || '';
  agreement.stripePaymentIntentId = order.stripePaymentIntentId || '';
  agreement.stripeChargeId = order.stripeChargeId || '';
  agreement.paymentState = agreementStateFromOrderState(stripeState);
  agreement.paymentStateUpdatedAt = new Date();
  agreement.needsManualReview = Boolean(order.needsManualReview);
  await agreement.save();

  if (!order.agreementId) {
    order.agreementId = agreement._id;
  }
};

const syncOrderRecord = async (order) => {
  const session = await getStripeCheckoutSession(order.stripeCheckoutSessionId, [
    'payment_intent',
    'payment_intent.latest_charge'
  ]).catch(() => null);

  if (!session) return false;

  const artifacts = await resolvePaymentArtifacts(session);
  const stripeState = deriveStripeState({
    session,
    paymentIntent: artifacts.paymentIntent,
    charge: artifacts.charge,
    dispute: artifacts.dispute
  });

  order.stripePaymentState = stripeState;
  order.paymentStatus = orderPaymentStatusFromStripeState(stripeState);
  order.stripePaymentIntentId = artifacts.paymentIntentId || '';
  order.stripeChargeId = artifacts.chargeId || '';
  order.stripeDisputeId = artifacts.disputeId || '';
  order.stripeDisputeStatus = artifacts.dispute?.status || '';
  order.amountRefunded = Number(artifacts.charge?.amount_refunded || 0);
  order.stripeLivemode = Boolean(session.livemode);
  order.lastStripeSyncAt = new Date();
  order.needsManualReview = shouldManualReviewOrder(order, stripeState);

  await syncAgreementForOrder({ order, stripeState });
  await order.save();

  return true;
};

export const syncRecentOrdersFromStripe = async ({
  limit = 250,
  maxAgeDays = 30,
  force = false
} = {}) => {
  if (!hasStripeConfigured) {
    return { skipped: true, reason: 'stripe-not-configured' };
  }

  if (!force) {
    const now = Date.now();
    if (activeSyncPromise) return activeSyncPromise;
    if (now - lastSyncAt < SYNC_COOLDOWN_MS) {
      return { skipped: true, reason: 'cooldown' };
    }
  }

  const normalizedLimit = Number.isFinite(Number(limit))
    ? Math.min(Math.max(Number(limit), 1), 500)
    : 250;

  const threshold = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  lastSyncAt = Date.now();

  const syncPromise = (async () => {
    const orders = await Order.find({
      stripeCheckoutSessionId: { $ne: '' },
      createdAt: { $gte: threshold }
    })
      .sort({ createdAt: -1 })
      .limit(normalizedLimit);

    let synced = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        const didSync = await syncOrderRecord(order);
        if (didSync) synced += 1;
      } catch (error) {
        failed += 1;
        console.error('Stripe order sync failed', order.stripeCheckoutSessionId, error.message);
      }
    }

    return {
      skipped: false,
      synced,
      failed,
      total: orders.length
    };
  })();

  activeSyncPromise = syncPromise;

  try {
    return await syncPromise;
  } finally {
    activeSyncPromise = null;
  }
};
