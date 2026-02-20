import path from 'path';
import Beat from '../models/Beat.js';
import Order from '../models/Order.js';
import SignedAgreement from '../models/SignedAgreement.js';
import { uploadBeatBuffer } from '../services/s3Service.js';
import { syncRecentOrdersFromStripe } from '../services/stripeSyncService.js';
import { PAID_LIKE_ORDER_STATES } from '../services/paymentStateService.js';

const parseBooleanQuery = (value, fallback) => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseLimit = (value, fallback = 250) => {
  const parsed = Number(value || fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), 500);
};

const paidContractFilter = {
  $or: [
    { paymentState: { $in: ['paid', 'partially_refunded', 'chargeback_won'] } },
    { paymentState: { $exists: false }, orderId: { $ne: null } }
  ]
};

const paidOrderFilter = {
  $or: [
    { stripePaymentState: { $in: PAID_LIKE_ORDER_STATES } },
    { stripePaymentState: { $exists: false }, paymentStatus: 'paid' }
  ]
};

export const getOwnerBeats = async (_req, res) => {
  const beats = await Beat.find().sort({ createdAt: -1 }).lean();
  return res.status(200).json({ beats });
};

export const createOwnerBeat = async (req, res) => {
  const beat = await Beat.create(req.validatedBody);
  return res.status(201).json({ beat });
};

export const updateOwnerBeat = async (req, res) => {
  const beat = await Beat.findByIdAndUpdate(req.params.beatId, req.validatedBody, {
    new: true,
    runValidators: true
  });

  if (!beat) {
    return res.status(404).json({ error: 'Beat not found' });
  }

  return res.status(200).json({ beat });
};

export const uploadOwnerBeatFiles = async (req, res) => {
  const beat = await Beat.findById(req.params.beatId);
  if (!beat) {
    return res.status(404).json({ error: 'Beat not found' });
  }

  const previewFile = req.files?.preview?.[0];
  const fullFile = req.files?.full?.[0];

  if (!previewFile && !fullFile) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  if (previewFile) {
    const ext = path.extname(previewFile.originalname) || '.wav';
    const key = `beats/${beat._id}/preview${ext}`;
    await uploadBeatBuffer({
      key,
      buffer: previewFile.buffer,
      contentType: previewFile.mimetype || 'audio/wav'
    });
    beat.previewFileKey = key;
  }

  if (fullFile) {
    const ext = path.extname(fullFile.originalname) || '.wav';
    const key = `beats/${beat._id}/full${ext}`;
    await uploadBeatBuffer({
      key,
      buffer: fullFile.buffer,
      contentType: fullFile.mimetype || 'audio/wav'
    });
    beat.fullFileKey = key;
  }

  await beat.save();

  return res.status(200).json({
    beat
  });
};

export const getOwnerOrders = async (req, res) => {
  const sync = parseBooleanQuery(req.query.sync, true);
  const limit = parseLimit(req.query.limit, 250);

  if (sync) {
    await syncRecentOrdersFromStripe({ limit });
  }

  const orders = await Order.find().sort({ createdAt: -1 }).limit(limit).lean();
  return res.status(200).json({ orders });
};

export const getOwnerContracts = async (req, res) => {
  const sync = parseBooleanQuery(req.query.sync, true);
  const includeUnpaid = parseBooleanQuery(req.query.includeUnpaid, false);
  const limit = parseLimit(req.query.limit, 250);

  if (sync) {
    await syncRecentOrdersFromStripe({ limit });
  }

  const pipeline = [];

  if (!includeUnpaid) {
    pipeline.push({
      $match: paidContractFilter
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'beats',
        localField: 'beatId',
        foreignField: '_id',
        as: 'beat'
      }
    },
    {
      $addFields: {
        beatTitle: {
          $ifNull: [{ $arrayElemAt: ['$beat.title', 0] }, 'Unknown Beat']
        }
      }
    },
    {
      $project: {
        beat: 0
      }
    }
  );

  const contracts = await SignedAgreement.aggregate(pipeline);

  return res.status(200).json({
    contracts
  });
};

export const getOwnerOverview = async (req, res) => {
  const sync = parseBooleanQuery(req.query.sync, true);

  if (sync) {
    await syncRecentOrdersFromStripe({ limit: 250 });
  }

  const [totalBeats, activeBeats, totalOrders, agreements, revenueAgg] = await Promise.all([
    Beat.countDocuments({}),
    Beat.countDocuments({ isActive: true }),
    Order.countDocuments(paidOrderFilter),
    SignedAgreement.countDocuments(paidContractFilter),
    Order.aggregate([
      { $match: paidOrderFilter },
      { $group: { _id: null, revenue: { $sum: '$amountTotal' } } }
    ])
  ]);

  return res.status(200).json({
    overview: {
      totalBeats,
      activeBeats,
      totalOrders,
      agreements,
      grossRevenueCents: revenueAgg[0]?.revenue || 0
    }
  });
};
