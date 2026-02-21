import mongoose from 'mongoose';

const ArtistProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Junah' },
    bio: { type: String, required: true },
    headline: { type: String, default: 'Junah - Producer / Artist' },
    location: { type: String, default: '' },
    socialLinks: {
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      spotify: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('ArtistProfile', ArtistProfileSchema);
