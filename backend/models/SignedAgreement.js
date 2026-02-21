import mongoose from 'mongoose';

const AgreementPaymentStateEnum = [
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

const SignedAgreementSchema = new mongoose.Schema(
  {
    beatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat', required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractTemplate', required: true },
    templateType: { type: String, enum: ['exclusive', 'non-exclusive', 'split'], required: true },
    templateVersion: { type: String, required: true },
    templateHash: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true, lowercase: true, trim: true },
    typedSignature: { type: String, required: true },
    acceptedFullTerms: { type: Boolean, required: true },
    acceptedSummary: { type: Boolean, required: true },
    buyerIp: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    signedAt: { type: Date, required: true, default: Date.now },
    agreementPdfKey: { type: String, default: '' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    stripeCheckoutSessionId: { type: String, default: '' },
    stripePaymentIntentId: { type: String, default: '' },
    stripeChargeId: { type: String, default: '' },
    paymentState: {
      type: String,
      enum: AgreementPaymentStateEnum,
      default: 'pending'
    },
    paymentStateUpdatedAt: { type: Date, default: null },
    needsManualReview: { type: Boolean, default: false }
  },
  { timestamps: true }
);

SignedAgreementSchema.index({ stripeCheckoutSessionId: 1 });
SignedAgreementSchema.index({ paymentState: 1 });

export default mongoose.model('SignedAgreement', SignedAgreementSchema);
