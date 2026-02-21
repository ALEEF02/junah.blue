import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

const buildToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email
    },
    env.JWT_SECRET,
    { expiresIn: '12h' }
  );

export const loginOwner = async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = buildToken(user);

  res.cookie('junah_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000
  });

  return res.status(200).json({
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role
    }
  });
};

export const logoutOwner = async (_req, res) => {
  res.clearCookie('junah_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production'
  });

  return res.status(200).json({ success: true });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.auth.sub).lean();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({
    user: {
      id: String(user._id),
      email: user.email,
      role: user.role
    }
  });
};
