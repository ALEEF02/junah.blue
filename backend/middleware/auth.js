import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const requireOwnerAuth = (req, res, next) => {
  const token = req.cookies?.junah_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.auth = payload;

    if (payload.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};
