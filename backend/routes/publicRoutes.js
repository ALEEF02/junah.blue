import { Router } from 'express';
import { z } from 'zod';
import {
  createApparelCheckout,
  createBeatCheckout,
  getCheckoutStatus,
  getApparelProducts,
  getContractTemplates,
  getPublicBeatById,
  getPublicBeats,
  getPublicProfile,
  signContract
} from '../controllers/publicController.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const SignContractSchema = z.object({
  beatId: z.string().min(1),
  licenseType: z.enum(['exclusive', 'non-exclusive', 'split']),
  templateId: z.string().min(1),
  buyerName: z.string().min(2),
  buyerEmail: z.email(),
  typedSignature: z.string().min(2),
  acceptedFullTerms: z.literal(true),
  acceptedSummary: z.literal(true)
});

const BeatCheckoutSchema = z.object({
  beatId: z.string().min(1),
  licenseType: z.enum(['exclusive', 'non-exclusive', 'split']),
  agreementId: z.string().min(1),
  buyerEmail: z.email().optional()
});

const ApparelCheckoutSchema = z.object({
  buyerEmail: z.email().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.union([z.string().min(1), z.number()]),
        quantity: z.number().int().min(1).max(10)
      })
    )
    .min(1)
});

router.get('/profile', getPublicProfile);
router.get('/beats', getPublicBeats);
router.get('/beats/:beatId', getPublicBeatById);
router.get('/contracts/templates', getContractTemplates);
router.post('/contracts/sign', validateBody(SignContractSchema), signContract);
router.post('/checkout/beat-session', validateBody(BeatCheckoutSchema), createBeatCheckout);
router.get('/checkout/status/:sessionId', getCheckoutStatus);
router.get('/apparel/products', getApparelProducts);
router.post('/checkout/apparel-session', validateBody(ApparelCheckoutSchema), createApparelCheckout);

export default router;
