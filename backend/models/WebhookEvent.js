import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'stripe' },
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('WebhookEvent', WebhookEventSchema);
