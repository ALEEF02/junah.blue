import mongoose from 'mongoose';

const ActivationSubscriberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    acceptedTerms: { type: Boolean, required: true },
    termsVersion: { type: String, required: true, default: '2026-08-07' },
    source: { type: String, required: true, default: 'website-activate' }
  },
  { timestamps: true }
);

export default mongoose.model('ActivationSubscriber', ActivationSubscriberSchema);
