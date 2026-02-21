import mongoose from 'mongoose';

const ContractTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['exclusive', 'non-exclusive', 'split'],
      required: true,
      index: true
    },
    version: { type: String, required: true },
    title: { type: String, required: true },
    fullText: { type: String, required: true },
    summaryText: { type: String, required: true },
    contentHash: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ContractTemplateSchema.index({ type: 1, version: 1 }, { unique: true });

export default mongoose.model('ContractTemplate', ContractTemplateSchema);
