import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';

const assertStripe = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }
};

export const createBeatCheckoutSession = async ({ beat, licenseType, buyerEmail, agreementId }) => {
  assertStripe();

  const price = licenseType === 'exclusive' ? beat.exclusivePriceCents : beat.nonExclusivePriceCents;
  const licenseLabel =
    licenseType === 'exclusive'
      ? 'Exclusive License'
      : licenseType === 'split'
        ? 'Split License (15%)'
        : 'Non-Exclusive License';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: env.STRIPE_SUCCESS_URL,
    cancel_url: env.STRIPE_CANCEL_URL,
    customer_email: buyerEmail,
    tax_id_collection: { enabled: env.STRIPE_TAX_ENABLED },
    automatic_tax: { enabled: env.STRIPE_TAX_ENABLED },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: price,
          product_data: {
            name: `${beat.title} - ${licenseLabel}`,
            description: beat.description || undefined
          }
        }
      }
    ],
    metadata: {
      orderType: 'beat',
      beatId: String(beat._id),
      agreementId: String(agreementId),
      licenseType
    }
  });

  return session;
};

export const createApparelCheckoutSession = async ({ buyerEmail, lineItems, metadataItems }) => {
  assertStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: env.STRIPE_SUCCESS_URL,
    cancel_url: env.STRIPE_CANCEL_URL,
    customer_email: buyerEmail || undefined,
    automatic_tax: { enabled: env.STRIPE_TAX_ENABLED },
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU']
    },
    line_items: lineItems,
    metadata: {
      orderType: 'apparel',
      items: Buffer.from(JSON.stringify(metadataItems)).toString('base64')
    }
  });

  return session;
};

export const verifyStripeEvent = (payload, signature, webhookSecret) => {
  assertStripe();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};
