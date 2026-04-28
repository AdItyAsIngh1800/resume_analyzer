import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { ApiError } from '../middleware/errorHandler.js';
import { validateGenuineEmail } from '../services/emailValidator.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

const registerRules = [
  { field: 'name', type: 'string', required: true, minLength: 1, maxLength: 100 },
  { field: 'email', type: 'email', required: true, maxLength: 254 },
  { field: 'password', type: 'string', required: true, minLength: 8, maxLength: 128 },
];

const loginRules = [
  { field: 'email', type: 'email', required: true },
  { field: 'password', type: 'string', required: true },
];

router.post('/register', validateBody(registerRules), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const emailCheck = await validateGenuineEmail(email);
    if (!emailCheck.ok) throw new ApiError(400, emailCheck.reason);

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, 'An account with that email already exists');

    const user = await User.create({ name, email, passwordHash: password });
    const token = signToken(user._id);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateBody(loginRules), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

export default router;
