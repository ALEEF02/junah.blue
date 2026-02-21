import dotenv from 'dotenv';

dotenv.config();

const toBool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/junah_blue',
  MONGODB_USERNAME: process.env.MONGODB_USERNAME || '',
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-me',
  OWNER_EMAIL: process.env.OWNER_EMAIL || 'owner@junah.blue',
  OWNER_PASSWORD: process.env.OWNER_PASSWORD || '',
  OWNER_PASSWORD_HASH: process.env.OWNER_PASSWORD_HASH || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000?checkout=success',
  STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000?checkout=cancelled',
  STRIPE_TAX_ENABLED: toBool(process.env.STRIPE_TAX_ENABLED, true),
  AWS_REGION: process.env.AWS_REGION || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_BUCKET_BEATS: process.env.S3_BUCKET_BEATS || '',
  S3_BUCKET_CONTRACTS: process.env.S3_BUCKET_CONTRACTS || '',
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || '',
  PRINTIFY_API_TOKEN: process.env.PRINTIFY_API_TOKEN || '',
  PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID || '',
  APPAREL_SYNC_TTL_SECONDS: Number(process.env.APPAREL_SYNC_TTL_SECONDS || 900)
};

export const hasAwsConfigured =
  Boolean(env.AWS_REGION && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);

export const hasStripeConfigured = Boolean(env.STRIPE_SECRET_KEY);

export const hasPrintifyConfigured = Boolean(env.PRINTIFY_API_TOKEN && env.PRINTIFY_SHOP_ID);

export const hasSesConfigured = Boolean(env.SES_FROM_EMAIL && hasAwsConfigured);
