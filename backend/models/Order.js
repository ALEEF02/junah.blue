import mongoose from 'mongoose';

const StripePaymentStateEnum = [
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

const OrderSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['beat', 'apparel'], required: true },
    stripeCheckoutSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String, default: '' },
    buyerEmail: { type: String, required: true, lowercase: true, trim: true },
    buyerName: { type: String, default: '' },
    beatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat', default: null },
    agreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'SignedAgreement', default: null },
    licenseType: { type: String, enum: ['exclusive', 'non-exclusive', 'split', ''], default: '' },
    amountSubtotal: { type: Number, default: 0 },
    amountTax: { type: Number, default: 0 },
    amountTotal: { type: Number, default: 0 },
    currency: { type: String, default: 'usd' },
    lineItems: {
      type: [
        {
          label: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
          amountCents: { type: Number, required: true, min: 0 },
          metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
        }
      ],
      default: []
    },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
    stripePaymentState: {
      type: String,
      enum: StripePaymentStateEnum,
      default: 'pending'
    },
    stripeChargeId: { type: String, default: '' },
    stripeDisputeId: { type: String, default: '' },
    stripeDisputeStatus: { type: String, default: '' },
    amountRefunded: { type: Number, default: 0 },
    stripeLivemode: { type: Boolean, default: false },
    lastStripeSyncAt: { type: Date, default: null },
    needsManualReview: { type: Boolean, default: false },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'fulfilled', 'failed', 'not-applicable'],
      default: 'pending'
    },
    printifyOrderId: { type: String, default: '' }
  },
  { timestamps: true }
);

OrderSchema.index({ stripePaymentIntentId: 1 });
OrderSchema.index({ stripeChargeId: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', OrderSchema);
