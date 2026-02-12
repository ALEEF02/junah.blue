import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ArtistProfile from '../models/ArtistProfile.js';
import ContractTemplate from '../models/ContractTemplate.js';
import { env } from '../config/env.js';

const seedContracts = [
  {
    type: 'exclusive',
    version: 'v1',
    title: 'Exclusive Beat License Agreement',
    fullText:
      'This Exclusive License grants the buyer exclusive rights to commercially use the beat after full payment. The producer retains attribution rights. Buyer must comply with crediting, lawful use, and royalty terms stated here. This starter template must be replaced with legal counsel approved language before production launch.',
    summaryText:
      'Exclusive: one buyer obtains exclusive commercial rights after payment. Junah keeps producer attribution rights. Replace with lawyer-approved final text before launch.'
  },
  {
    type: 'non-exclusive',
    version: 'v1',
    title: 'Non-Exclusive Beat License Agreement',
    fullText:
      'This Non-Exclusive License grants the buyer commercial usage rights while allowing Junah to license the same beat to other buyers. Buyer must follow attribution and usage restrictions. This starter template is informational and should be replaced with legal counsel approved terms.',
    summaryText:
      'Non-exclusive: buyer can use the beat commercially, but Junah can sell additional licenses to others.'
  },
  {
    type: 'split',
    version: 'v1',
    title: 'Split Participation Addendum (15%)',
    fullText:
      'This split addendum defines a fixed 15% split participation model for qualified compositions produced by Junah. Buyers acknowledge and accept this split structure before purchase. Final legal language should be reviewed by qualified counsel.',
    summaryText:
      'Split contract: fixed 15% share terms apply where split participation is selected.'
  }
];

const hashContent = (text) => crypto.createHash('sha256').update(text).digest('hex');

export const ensureBootstrapData = async () => {
  const ownerEmail = env.OWNER_EMAIL.toLowerCase();

  let owner = await User.findOne({ email: ownerEmail });
  if (!owner) {
    const passwordHash = env.OWNER_PASSWORD_HASH || (env.OWNER_PASSWORD ? await bcrypt.hash(env.OWNER_PASSWORD, 12) : null);

    if (!passwordHash) {
      console.warn('No owner user created because OWNER_PASSWORD/OWNER_PASSWORD_HASH is missing.');
    } else {
      owner = await User.create({
        email: ownerEmail,
        passwordHash,
        role: 'owner'
      });
      console.log(`Bootstrapped owner account: ${owner.email}`);
    }
  }

  const profile = await ArtistProfile.findOne();
  if (!profile) {
    await ArtistProfile.create({
      name: 'Junah',
      headline: 'Junah - Producer / Artist',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Junah creates emotionally rich beats blending melodic restraint with modern percussion and expressive harmonic texture.'
    });
    console.log('Bootstrapped default artist profile');
  }

  for (const contract of seedContracts) {
    const contentHash = hashContent(contract.fullText + contract.summaryText + contract.version);

    await ContractTemplate.findOneAndUpdate(
      { type: contract.type, version: contract.version },
      { ...contract, contentHash, isActive: true },
      { upsert: true }
    );
  }

  console.log('Bootstrapped default contract templates');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const mongoose = await import('mongoose');
  const { connectDb } = await import('../config/db.js');

  try {
    await connectDb();
    await ensureBootstrapData();
    await mongoose.default.disconnect();
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  }
}
