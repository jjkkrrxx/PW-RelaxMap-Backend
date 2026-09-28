import createHttpError from 'http-errors';
import { Location } from '../models/location.js';
// потрібні для populate: реєструють моделі User і Feedback
import '../models/user.js';
import '../models/feedback.js';
import { notImplemented } from '../utils/notImplemented.js';
import {
  saveLocationImageToCloudinary,
  deleteImageFromCloudinary,
} from '../utils/saveLocationImageToCloudinary.js';

export const getLocations = notImplemented;

export const getLocationById = async (req, res, next) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findById(locationId)
      .populate('ownerId', 'name avatar')
      .populate('feedbacksId');

    if (!location) {
      throw createHttpError(404, 'Location not found');
    }

    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res) => {
  const { file, user } = req;

  if (!req.file) {
    throw createHttpError(400, 'No file');
  }
  const result = await saveLocationImageToCloudinary(file.buffer, user._id);

  const location = await Location.create({
    ...req.body,
    image: result.secure_url,
    ownerId: user._id,
  });

  res.status(201).json(location);
};

export const updateLocation = async (req, res) => {
  const { locationId } = req.params;

  const location = await Location.findById(locationId);

  if (!location) {
    throw createHttpError(404, 'Location not found');
  }

  const { user, file } = req;

  if (location.ownerId.toString() !== user._id.toString()) {
    throw createHttpError(403, 'You are not allowed to update this location');
  }

  const updatedInfo = {
    ...req.body,
  };

  if (file) {
    const result = await saveLocationImageToCloudinary(file.buffer, user._id);

    updatedInfo.image = result.secure_url;
  }

  if (!file && Object.keys(updatedInfo).length === 0) {
    throw createHttpError(400, 'No update data provided');
  }

  const updatedLocation = await Location.findByIdAndUpdate(
    locationId,
    updatedInfo,
    {
      new: true,
      runValidators: true,
      returnDocument: 'after',
    },
  );

  // нове фото вже збережено в базі — прибираємо старе з Cloudinary
  if (file) {
    try {
      await deleteImageFromCloudinary(location.image);
    } catch (error) {
      console.error('Failed to delete old image:', error.message);
    }
  }

  res.status(200).json(updatedLocation);
};
