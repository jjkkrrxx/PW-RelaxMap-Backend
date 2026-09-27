import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { notImplemented } from '../utils/notImplemented.js';

export const getCurrentUser = async (req, res) => {
  res.status(200).json(req.user);
};
export const updateCurrentUser = notImplemented;
export const updateUserAvatar = notImplemented;

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    name: user.name,
    avatar: user.avatar,
    articlesAmount: user.articlesAmount ?? 0,
  });
};

export const getUserLocations = notImplemented;