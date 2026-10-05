import createHttpError from 'http-errors';
import { Location } from '../models/location.js';
// потрібні для populate: реєструють моделі User і Feedback
import '../models/user.js';
import '../models/feedback.js';
import {
  saveLocationImageToCloudinary,
  deleteImageFromCloudinary,
} from '../utils/saveLocationImageToCloudinary.js';

const SORT_OPTIONS = {
  popular: { rate: -1 },
  rating: { rate: -1 },
  new: { _id: -1 },
  'name-asc': { name: 1 },
  'name-desc': { name: -1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getLocations = async (req, res) => {
  const { region, search, sort } = req.query;

  // type може прийти рядком (?type=lis) або масивом (?type=lis&type=ozero)
  const typeList = [].concat(req.query.type ?? []);
  const isPopular = typeList.includes('popular');
  const types = typeList.filter((t) => t !== 'popular');

  const filter = {};

  if (region) filter.region = region;
  if (types.length) filter.locationType = { $in: types };
  if (search) {
    filter.name = {
      $regex: escapeRegex(search),
      $options: 'i',
    };
  }

  const page = Number(req.query.page) || 1;
  const limit = isPopular ? 6 : Number(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  let query = Location.find(filter).skip(skip).limit(limit);

  // без sort — порядок БД (як у ТЗ)
  const sortOrder = isPopular ? SORT_OPTIONS.popular : SORT_OPTIONS[sort];

  if (sortOrder) {
    query = query.sort(sortOrder).collation({ locale: 'uk' });
  }

  const [locations, totalLocations] = await Promise.all([
    query,
    Location.countDocuments(filter),
  ]);

  res.status(200).json({
    data: locations,
    page,
    limit,
    totalPages: Math.ceil(totalLocations / limit),
    total: totalLocations,
  });
};

export const getLocationById = async (req, res, next) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findById(locationId)
      .populate('ownerId', 'name avatar')
      // лише схвалені відгуки: нові (pending) з'являться після модерації
      .populate({ path: 'feedbacksId', match: { status: 'approved' } });

    if (!location) {
      throw createHttpError(404, 'Локацію не знайдено');
    }

    res.status(200).json({ data: location });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res) => {
  const { file, user } = req;

  if (!req.file) {
    throw createHttpError(400, 'Файл не завантажено');
  }
  const result = await saveLocationImageToCloudinary(file.buffer, user._id);

  const location = await Location.create({
    ...req.body,
    image: result.secure_url,
    ownerId: user._id,
  });

  res.status(201).json({ data: location });
};

export const updateLocation = async (req, res) => {
  const { locationId } = req.params;

  const location = await Location.findById(locationId);

  if (!location) {
    throw createHttpError(404, 'Локацію не знайдено');
  }

  const { user, file } = req;

  if (location.ownerId.toString() !== user._id.toString()) {
    throw createHttpError(403, 'У вас немає прав для редагування цієї локації');
  }

  const updatedInfo = {
    ...req.body,
  };

  if (file) {
    const result = await saveLocationImageToCloudinary(file.buffer, user._id);

    updatedInfo.image = result.secure_url;
  }

  if (!file && Object.keys(updatedInfo).length === 0) {
    throw createHttpError(400, 'Дані для оновлення не надано');
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
      console.error('Не вдалося видалити старе зображення:', error.message);
    }
  }

  res.status(200).json({ data: updatedLocation });
};
