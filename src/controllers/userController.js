import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Location } from '../models/location.js';
import { notImplemented } from '../utils/notImplemented.js';

export const getCurrentUser = async (req, res) => {
  res.status(200).json({ data: req.user });
};

export const updateCurrentUser = notImplemented;
export const updateUserAvatar = notImplemented;

export const getUserById = async (req, res) => {
  const { userId } = req.params;

  const [user, articlesAmount] = await Promise.all([
    User.findById(userId),
    Location.countDocuments({ ownerId: userId }),
  ]);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    data: {
      name: user.name,
      avatar: user.avatar,
      articlesAmount,
    },
  });
};

export const getUserLocations = async (req, res) => {
  const { userId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 9;

  const skip = (page - 1) * limit;

  const locationsQuery = Location.find({
    ownerId: userId,
  });

  const [totalLocations, locations] = await Promise.all([
    locationsQuery.clone().countDocuments(),
    locationsQuery.skip(skip).limit(limit),
  ]);

  const totalPages = Math.ceil(totalLocations / limit);

  res.status(200).json({
    data: locations,
    page,
    limit,
    totalPages,
    total: totalLocations,
  });
};
