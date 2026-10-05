import crypto from 'node:crypto';
import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/time.js';
import { Session } from '../models/session.js';

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const generateToken = () => crypto.randomBytes(30).toString('base64');

const generateTokens = () => {
  const now = Date.now();

  return {
    accessToken: generateToken(),
    refreshToken: generateToken(),
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + THIRTY_DAYS),
  };
};

/** Видаляє стару сесію юзера і створює нову: access 15 хв, refresh 30 днів. */
export const createSession = async (userId) => {
  await Session.deleteMany({ userId });

  return Session.create({
    userId,
    ...generateTokens(),
  });
};

/** Записує 3 httpOnly cookie: sessionId, accessToken, refreshToken. */
export const setupSession = (res, session) => {
  res.cookie('sessionId', session._id.toString(), {
    ...baseCookieOptions,
    expires: session.refreshTokenValidUntil,
  });
  res.cookie('accessToken', session.accessToken, {
    ...baseCookieOptions,
    expires: session.accessTokenValidUntil,
  });
  res.cookie('refreshToken', session.refreshToken, {
    ...baseCookieOptions,
    expires: session.refreshTokenValidUntil,
  });
};

export const clearSessionCookies = (res) => {
  res.clearCookie('sessionId', baseCookieOptions);
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', baseCookieOptions);
};

/** Перевіряє sessionId + refreshToken, видаляє стару сесію і створює нову. */
export const refreshSession = async ({ sessionId, refreshToken }) => {
  if (!sessionId || !refreshToken || !isValidObjectId(sessionId)) {
    throw createHttpError(401, 'Сесію не знайдено');
  }

  const session = await Session.findOne({ _id: sessionId, refreshToken });

  if (!session) {
    throw createHttpError(401, 'Сесію не знайдено');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Термін дії токена сесії закінчився');
  }

  // createSession сама видаляє стару сесію цього юзера
  return createSession(session.userId);
};
