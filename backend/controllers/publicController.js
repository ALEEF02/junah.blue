import Beat from '../models/Beat.js';
import ArtistProfile from '../models/ArtistProfile.js';
import ContractTemplate from '../models/ContractTemplate.js';
import SignedAgreement from '../models/SignedAgreement.js';
import { getBeatSignedReadUrl } from '../services/s3Service.js';
import { createBeatCheckoutSession, createApparelCheckoutSession } from '../services/stripeService.js';
import { syncPrintifyCatalog } from '../services/printifyService.js';

const toBeatPublicShape = async (beat) => ({
  id: String(beat._id),
  title: beat.title,
  description: beat.description,
  bpm: beat.bpm,
  key: beat.key,
  tags: beat.tags,
  previewUrl: beat.previewFileKey ? await getBeatSignedReadUrl(beat.previewFileKey, 900) : '',
  isAvailable: beat.isAvailable,
  isActive: beat.isActive,
  pricing: {
    exclusivePriceCents: beat.exclusivePriceCents,
    nonExclusivePriceCents: beat.nonExclusivePriceCents
  },
  licenseOptions: ['exclusive', 'non-exclusive', 'split']
});

export const getPublicProfile = async (_req, res) => {
  const profile = await ArtistProfile.findOne().lean();

  if (!profile) {
    return res.status(200).json({
      name: 'Junah',
      headline: 'Junah - Producer / Artist',
      bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Junah produces emotionally driven records, atmospheric textures, and polished drum-forward beats for artists and creators.',
      socialLinks: {
        instagram: '',
        youtube: '',
        spotify: ''
      }
    });
  }

  return res.status(200).json(profile);
};

export const getPublicBeats = async (_req, res) => {
  const beats = await Beat.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  const mapped = await Promise.all(beats.map((beat) => toBeatPublicShape(beat)));

  return res.status(200).json({ beats: mapped });
};

export const getPublicBeatById = async (req, res) => {
  const beat = await Beat.findOne({ _id: req.params.beatId, isActive: true }).lean();

  if (!beat) {
    return res.status(404).json({ error: 'Beat not found' });
  }

  return res.status(200).json(await toBeatPublicShape(beat));
};

export const getContractTemplates = async (_req, res) => {
  const templates = await ContractTemplate.find({ isActive: true }).sort({ type: 1, createdAt: -1 }).lean();

  return res.status(200).json({
    templates: templates.map((template) => ({
      id: String(template._id),
      type: template.type,
      version: template.version,
      title: template.title,
      fullText: template.fullText,
      summaryText: template.summaryText
    }))
  });
};

export const signContract = async (req, res) => {
  const {
    beatId,
    licenseType,
    templateId,
    buyerName,
    buyerEmail,
    typedSignature,
    acceptedFullTerms,
    acceptedSummary
  } = req.validatedBody;

  const beat = await Beat.findOne({ _id: beatId, isActive: true });
  if (!beat) {
    return res.status(404).json({ error: 'Beat not found' });
  }

  if (licenseType === 'exclusive' && !beat.isAvailable) {
    return res.status(400).json({ error: 'This beat is no longer available for exclusive purchase' });
  }

  if (!acceptedFullTerms || !acceptedSummary) {
    return res.status(400).json({ error: 'Contract acceptance is required before purchase' });
  }

  const template = await ContractTemplate.findOne({ _id: templateId, type: licenseType, isActive: true });
  if (!template) {
    return res.status(400).json({ error: 'Invalid contract template selection' });
  }

  const agreement = await SignedAgreement.create({
    beatId,
    templateId,
    templateType: template.type,
    templateVersion: template.version,
    templateHash: template.contentHash,
    buyerName,
    buyerEmail,
    typedSignature,
    acceptedFullTerms,
    acceptedSummary,
    buyerIp: req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip,
    userAgent: req.headers['user-agent'] || '',
    signedAt: new Date()
  });

  return res.status(201).json({
    agreementId: String(agreement._id)
  });
};

export const createBeatCheckout = async (req, res) => {
  const { beatId, licenseType, agreementId, buyerEmail } = req.validatedBody;

  const [beat, agreement] = await Promise.all([
    Beat.findOne({ _id: beatId, isActive: true }),
    SignedAgreement.findById(agreementId)
  ]);

  if (!beat || !agreement) {
    return res.status(400).json({ error: 'Invalid beat or agreement' });
  }

  if (String(agreement.beatId) !== String(beat._id) || agreement.templateType !== licenseType) {
    return res.status(400).json({ error: 'Agreement does not match this purchase' });
  }

  if (licenseType === 'exclusive' && !beat.isAvailable) {
    return res.status(400).json({ error: 'This beat is no longer available for exclusive purchase' });
  }

  const session = await createBeatCheckoutSession({
    beat,
    licenseType,
    buyerEmail: buyerEmail || agreement.buyerEmail,
    agreementId
  });

  return res.status(200).json({ checkoutUrl: session.url, sessionId: session.id });
};

export const getApparelProducts = async (_req, res) => {
  const products = await syncPrintifyCatalog(false);
  return res.status(200).json({ products });
};

export const createApparelCheckout = async (req, res) => {
  const { buyerEmail, items } = req.validatedBody;
  const catalog = await syncPrintifyCatalog(false);

  const lineItems = [];
  const metadataItems = [];

  for (const item of items) {
    const product = catalog.find((entry) => entry.id === item.productId);
    const variant = product?.variants.find((entry) => String(entry.id) === String(item.variantId));

    if (!product || !variant) {
      return res.status(400).json({ error: 'Invalid apparel cart selection' });
    }

    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: variant.priceCents,
        product_data: {
          name: `${product.title} - ${variant.title}`,
          images: product.imageUrl ? [product.imageUrl] : undefined
        }
      }
    });

    metadataItems.push({
      productId: product.id,
      variantId: variant.id,
      quantity: item.quantity,
      label: `${product.title} - ${variant.title}`,
      amountCents: variant.priceCents
    });
  }

  const session = await createApparelCheckoutSession({
    buyerEmail,
    lineItems,
    metadataItems
  });

  return res.status(200).json({ checkoutUrl: session.url, sessionId: session.id });
};
