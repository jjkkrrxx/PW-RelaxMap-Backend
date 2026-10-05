import bcrypt from 'bcrypt';
import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';
import {
  clearSessionCookies,
  createSession,
  refreshSession,
  setupSession,
} from '../services/auth.js';
import { notImplemented } from '../utils/notImplemented.js';

// використовується в registerUser (задача №3)
const SALT_ROUNDS = 10;

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'Ця електронна адреса вже використовується');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const session = await createSession(user._id);
    setupSession(res, session);

    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Невірна електронна адреса або пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Невірна електронна адреса або пароль');
    }

    const session = await createSession(user._id);
    setupSession(res, session);

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies ?? {};

    if (sessionId && isValidObjectId(sessionId)) {
      await Session.findByIdAndDelete(sessionId);
    }

    clearSessionCookies(res);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies ?? {};

    const session = await refreshSession({ sessionId, refreshToken });

    setupSession(res, session);

    res.status(200).json({ message: 'Сесію успішно оновлено' });
  } catch (error) {
    clearSessionCookies(res);
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const { sessionId, accessToken, refreshToken } = req.cookies ?? {};

    if (sessionId && accessToken && isValidObjectId(sessionId)) {
      const session = await Session.findOne({ _id: sessionId, accessToken });

      if (session && session.accessTokenValidUntil >= new Date()) {
        return res.status(200).json({ success: true });
      }
    }

    if (sessionId && refreshToken && isValidObjectId(sessionId)) {
      try {
        const session = await refreshSession({ sessionId, refreshToken });
        setupSession(res, session);
        return res.status(200).json({ success: true });
      } catch {
        return res.status(200).json({ success: false });
      }
    }

    res.status(200).json({ success: false });
  } catch (error) {
    next(error);
  }
};

export const requestResetEmail = notImplemented;
export const resetPassword = notImplemented;
