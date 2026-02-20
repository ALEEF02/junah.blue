export const ORDER_PAYMENT_STATES = [
  'pending',
  'paid',
  'failed',
  'canceled',
  'processing',
  'refunded',
  'partially_refunded',
  'disputed',
  'chargeback_won',
  'chargeback_lost'
];

export const AGREEMENT_PAYMENT_STATES = [
  'pending',
  'paid',
  'failed',
  'canceled',
  'expired',
  'refunded',
  'partially_refunded',
  'disputed',
  'chargeback_won',
  'chargeback_lost'
];

export const PAID_LIKE_ORDER_STATES = ['paid', 'partially_refunded', 'chargeback_won'];

export const orderPaymentStatusFromStripeState = (stripeState) => {
  if (stripeState === 'paid' || stripeState === 'partially_refunded') return 'paid';
  if (['refunded', 'failed', 'canceled', 'chargeback_lost'].includes(stripeState)) return 'failed';
  return 'pending';
};

export const agreementStateFromOrderState = (orderState) => {
  if (orderState === 'processing') return 'pending';
  if (AGREEMENT_PAYMENT_STATES.includes(orderState)) return orderState;
  return 'pending';
};

export const shouldManualReviewOrder = (order, stripeState) =>
  Boolean(
    order &&
      order.type === 'beat' &&
      order.licenseType === 'exclusive' &&
      ['refunded', 'chargeback_lost'].includes(stripeState)
  );

export const orderStateFromPaymentIntentStatus = (status) => {
  if (status === 'succeeded') return 'paid';
  if (status === 'processing') return 'processing';
  if (status === 'canceled') return 'canceled';
  if (status === 'requires_payment_method') return 'failed';
  return 'pending';
};

export const orderStateFromDisputeStatus = (disputeStatus) => {
  if (disputeStatus === 'won') return 'chargeback_won';
  if (disputeStatus === 'lost') return 'chargeback_lost';
  return 'disputed';
};

export const orderStateFromCharge = ({ charge, paymentIntentStatus }) => {
  if (!charge) return orderStateFromPaymentIntentStatus(paymentIntentStatus);

  if (charge.disputed) return 'disputed';

  const amount = Number(charge.amount || 0);
  const refunded = Number(charge.amount_refunded || 0);

  if (refunded > 0 && refunded >= amount) return 'refunded';
  if (refunded > 0) return 'partially_refunded';

  if (charge.paid) return 'paid';
  if (charge.status === 'failed') return 'failed';
  if (charge.status === 'pending') return 'processing';

  return orderStateFromPaymentIntentStatus(paymentIntentStatus);
};
