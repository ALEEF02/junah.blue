import mongoose from 'mongoose';

const ApparelCatalogCacheSchema = new mongoose.Schema(
  {
    source: { type: String, default: 'printify', unique: true },
    products: { type: [mongoose.Schema.Types.Mixed], default: [] },
    syncedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('ApparelCatalogCache', ApparelCatalogCacheSchema);
