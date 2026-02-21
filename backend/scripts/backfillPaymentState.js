import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import Order from '../models/Order.js';
import SignedAgreement from '../models/SignedAgreement.js';
import {
  agreementStateFromOrderState,
  orderPaymentStatusFromStripeState
} from '../services/paymentStateService.js';

const initialStripeStateFromLegacyPaymentStatus = (paymentStatus) => {
  if (paymentStatus === 'paid') return 'paid';
  if (paymentStatus === 'failed') return 'failed';
  return 'pending';
};

const run = async () => {
  await connectDb();

  let updatedOrders = 0;
  const orders = await Order.find({});

  for (const order of orders) {
    const currentState =
      order.stripePaymentState || initialStripeStateFromLegacyPaymentStatus(order.paymentStatus);

    order.stripePaymentState = currentState;
    order.paymentStatus = orderPaymentStatusFromStripeState(currentState);
    order.stripeChargeId = order.stripeChargeId || '';
    order.stripeDisputeId = order.stripeDisputeId || '';
    order.stripeDisputeStatus = order.stripeDisputeStatus || '';
    order.amountRefunded = Number(order.amountRefunded || 0);
    order.needsManualReview = Boolean(order.needsManualReview);
    order.lastStripeSyncAt = order.lastStripeSyncAt || null;
    order.stripeLivemode = Boolean(order.stripeLivemode);

    await order.save();
    updatedOrders += 1;
  }

  let updatedAgreements = 0;
  const agreements = await SignedAgreement.find({});

  for (const agreement of agreements) {
    const linkedOrder =
      (agreement.orderId ? await Order.findById(agreement.orderId) : null) ||
      (agreement.stripeCheckoutSessionId
        ? await Order.findOne({ stripeCheckoutSessionId: agreement.stripeCheckoutSessionId })
        : null);
    const baseOrderState = linkedOrder?.stripePaymentState || (agreement.orderId ? 'paid' : 'pending');

    if (linkedOrder && !agreement.orderId) {
      agreement.orderId = linkedOrder._id;
    }

    agreement.paymentState = agreement.paymentState || agreementStateFromOrderState(baseOrderState);
    agreement.paymentStateUpdatedAt = agreement.paymentStateUpdatedAt || new Date();
    agreement.stripeCheckoutSessionId =
      agreement.stripeCheckoutSessionId || linkedOrder?.stripeCheckoutSessionId || '';
    agreement.stripePaymentIntentId =
      agreement.stripePaymentIntentId || linkedOrder?.stripePaymentIntentId || '';
    agreement.stripeChargeId = agreement.stripeChargeId || linkedOrder?.stripeChargeId || '';
    agreement.needsManualReview = Boolean(
      agreement.needsManualReview || linkedOrder?.needsManualReview
    );

    await agreement.save();
    updatedAgreements += 1;
  }

  console.log(`Backfill complete. Orders updated: ${updatedOrders}, agreements updated: ${updatedAgreements}`);
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Payment state backfill failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  });
