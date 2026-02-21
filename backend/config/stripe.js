import Stripe from 'stripe';
import { env, hasStripeConfigured } from './env.js';

export const stripe = hasStripeConfigured
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil'
    })
  : null;
