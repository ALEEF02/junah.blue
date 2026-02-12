import mongoose from 'mongoose';

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
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
  },
  { timestamps: true }
);

export default mongoose.model('SignedAgreement', SignedAgreementSchema);
