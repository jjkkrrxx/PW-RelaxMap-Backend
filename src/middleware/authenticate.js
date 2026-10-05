import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const { sessionId, accessToken } = req.cookies;

    if (!sessionId || !accessToken) {
      throw createHttpError(401, 'Відсутній токен доступу');
    }

    if (!isValidObjectId(sessionId)) {
      throw createHttpError(401, 'Невірний ідентифікатор сесії');
    }

    const session = await Session.findOne({
      _id: sessionId,
      accessToken,
    });

    if (!session) {
      throw createHttpError(401, 'Сесію не знайдено');
    }

    if (session.accessTokenValidUntil < new Date()) {
      throw createHttpError(401, 'Термін дії токена доступу закінчився');
    }

    const user = await User.findById(session.userId);

    if (!user) {
      throw createHttpError(401, 'Користувача не знайдено');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
