import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import {
  createOwnerBeat,
  getOwnerBeats,
  getOwnerContracts,
  getOwnerOrders,
  getOwnerOverview,
  updateOwnerBeat,
  uploadOwnerBeatFiles
} from '../controllers/ownerController.js';
import { requireOwnerAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CreateBeatSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().default(''),
  bpm: z.number().int().positive().optional().nullable(),
  key: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  exclusivePriceCents: z.number().int().min(0),
  nonExclusivePriceCents: z.number().int().min(0),
  isAvailable: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true)
});

const UpdateBeatSchema = z
  .object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    bpm: z.number().int().positive().optional().nullable(),
    key: z.string().optional(),
    tags: z.array(z.string()).optional(),
    exclusivePriceCents: z.number().int().min(0).optional(),
    nonExclusivePriceCents: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required for update'
  });

router.use(requireOwnerAuth);

router.get('/beats', getOwnerBeats);
router.post('/beats', validateBody(CreateBeatSchema), createOwnerBeat);
router.patch('/beats/:beatId', validateBody(UpdateBeatSchema), updateOwnerBeat);
router.post(
  '/beats/:beatId/files',
  upload.fields([
    { name: 'preview', maxCount: 1 },
    { name: 'full', maxCount: 1 }
  ]),
  uploadOwnerBeatFiles
);

router.get('/orders', getOwnerOrders);
router.get('/contracts', getOwnerContracts);
router.get('/overview', getOwnerOverview);

export default router;
