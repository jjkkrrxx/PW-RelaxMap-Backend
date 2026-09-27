import { notImplemented } from '../utils/notImplemented.js';
import { Location } from '../models/location.js';

export const getCurrentUser = async (req, res) => {
  res.status(200).json(req.user);
};
export const updateCurrentUser = notImplemented;
export const updateUserAvatar = notImplemented;
export const getUserById = notImplemented;
export const getUserLocations = async (req, res) => {
  const { userId } = req.params;

  const page = Number(req.query) || 1;
  const limit = Number(req.query) || 10;

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
    page,
    limit,
    totalPages,
    totalLocations,
    locations,
  });
};
