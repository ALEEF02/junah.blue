import path from 'path';
import Beat from '../models/Beat.js';
import Order from '../models/Order.js';
import SignedAgreement from '../models/SignedAgreement.js';
import { uploadBeatBuffer } from '../services/s3Service.js';

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

export const getOwnerOrders = async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(250).lean();
  return res.status(200).json({ orders });
};

export const getOwnerContracts = async (_req, res) => {
  const contracts = await SignedAgreement.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 250 },
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
  ]);

  return res.status(200).json({
    contracts
  });
};

export const getOwnerOverview = async (_req, res) => {
  const [totalBeats, activeBeats, totalOrders, agreements, revenueAgg] = await Promise.all([
    Beat.countDocuments({}),
    Beat.countDocuments({ isActive: true }),
    Order.countDocuments({ paymentStatus: 'paid' }),
    SignedAgreement.countDocuments({}),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
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
