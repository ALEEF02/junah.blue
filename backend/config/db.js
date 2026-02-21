import mongoose from 'mongoose';
import { env } from './env.js';

const uriHasInlineCredentials = (uri) => {
  const schemeIndex = uri.indexOf('://');
  if (schemeIndex === -1) return false;

  const authorityStart = schemeIndex + 3;
  const pathStart = uri.indexOf('/', authorityStart);
  const queryStart = uri.indexOf('?', authorityStart);
  const endCandidates = [pathStart, queryStart].filter((value) => value !== -1);
  const authorityEnd = endCandidates.length ? Math.min(...endCandidates) : uri.length;
  const authority = uri.slice(authorityStart, authorityEnd);

  return authority.includes('@');
};

export const connectDb = async () => {
  const options = {};
  const hasEnvAuth = Boolean(env.MONGODB_USERNAME && env.MONGODB_PASSWORD);
  const hasInlineAuth = uriHasInlineCredentials(env.MONGODB_URI);

  if (hasEnvAuth && !hasInlineAuth) {
    options.user = env.MONGODB_USERNAME;
    options.pass = env.MONGODB_PASSWORD;
  }

  await mongoose.connect(env.MONGODB_URI, options);
  console.log('MongoDB connected');
};
