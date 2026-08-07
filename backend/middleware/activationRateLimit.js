const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attemptsByIp = new Map();
let requestCount = 0;

export const activationRateLimit = (req, res, next) => {
  const now = Date.now();
  requestCount += 1;
  if (requestCount % 250 === 0) {
    attemptsByIp.forEach((attempt, ip) => {
      if (attempt.resetAt <= now) attemptsByIp.delete(ip);
    });
  }
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const current = attemptsByIp.get(key);

  if (!current || current.resetAt <= now) {
    attemptsByIp.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({ error: 'Too many registration attempts. Please try again later.' });
  }

  current.count += 1;
  return next();
};
