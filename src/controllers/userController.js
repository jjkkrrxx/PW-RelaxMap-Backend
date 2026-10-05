import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Location } from '../models/location.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { deleteImageFromCloudinary } from '../utils/saveLocationImageToCloudinary.js';

export const getCurrentUser = async (req, res) => {
  res.status(200).json({ data: req.user });
};

/** Оновлює ім'я поточного юзера. Валідація (2–32 символи) — у celebrate. */
export const updateCurrentUser = async (req, res) => {
  const { name } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name },
    { new: true, runValidators: true },
  );

  res.status(200).json({ data: user });
};

/** Оновлює аватар поточного юзера: нове фото в Cloudinary, старе — видаляємо. */
export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'Файл аватара є обов’язковим');
  }

  const previousAvatar = req.user.avatar;
  const avatar = await saveFileToCloudinary(req.file, 'relax-map/avatars');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true },
  );

  // нове фото вже в базі — прибираємо старе (дефолтний аватар не з Cloudinary, його не чіпаємо)
  try {
    await deleteImageFromCloudinary(previousAvatar);
  } catch {
    // не вдалося видалити старе фото — не причина відповідати помилкою
  }

  res.status(200).json({ data: user });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;

  const [user, articlesAmount] = await Promise.all([
    User.findById(userId),
    Location.countDocuments({ ownerId: userId }),
  ]);

  if (!user) {
    throw createHttpError(404, 'Користувача не знайдено');
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
