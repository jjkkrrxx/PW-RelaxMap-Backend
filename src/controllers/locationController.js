import { Location } from '../models/location.js';
import { notImplemented } from '../utils/notImplemented.js';
import { saveLocationImageToCloudinary } from '../utils/saveLocationImageToCloudinary.js';

export const getLocations = notImplemented;
export const getLocationById = notImplemented;

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
  console.log(location);

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

  res.status(200).json(updatedLocation);
};
