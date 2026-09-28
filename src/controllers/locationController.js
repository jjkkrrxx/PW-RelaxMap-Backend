import createHttpError from 'http-errors';
import { Location } from '../models/location.js';
import '../models/user.js';
import '../models/feedback.js';
import { notImplemented } from '../utils/notImplemented.js';

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
export const createLocation = notImplemented;
export const updateLocation = notImplemented;
