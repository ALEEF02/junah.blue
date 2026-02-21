import mongoose from 'mongoose';

const BeatSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    bpm: { type: Number, default: null },
    key: { type: String, default: '' },
    tags: { type: [String], default: [] },
    previewFileKey: { type: String, default: '' },
    fullFileKey: { type: String, default: '' },
    exclusivePriceCents: { type: Number, required: true, min: 0 },
    nonExclusivePriceCents: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Beat', BeatSchema);
