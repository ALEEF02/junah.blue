import mongoose from 'mongoose';

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
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'fulfilled', 'failed', 'not-applicable'],
      default: 'pending'
    },
    printifyOrderId: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
