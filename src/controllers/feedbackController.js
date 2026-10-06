import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { Feedback } from '../models/feedback.js';
import { Location } from '../models/location.js';

const FEEDBACK_CONFIG = {
  DEFAULT_STATUS: 'approved',
  SORT_ORDER: { _id: -1 },
};

export const getFeedbacks = async (req, res, next) => {
  try {
    const { locationId } = req.query;

    const filter = { status: FEEDBACK_CONFIG.DEFAULT_STATUS };

    if (locationId) {
      filter.locationId = locationId;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [feedbacks, totalFeedbacks] = await Promise.all([
      Feedback.find(filter)
        .sort(FEEDBACK_CONFIG.SORT_ORDER)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'locationId',
          select: 'name locationType region',
        })
        .populate('owner', 'name avatar'),
      Feedback.countDocuments(filter),
    ]);

    res.status(200).json({
      data: feedbacks,
      page,
      limit,
      totalPages: Math.ceil(totalFeedbacks / limit),
      total: totalFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// Середній рейтинг локації за схваленими відгуками, до одного знака після коми.
const getLocationRate = async (locationId) => {
  const targetId = mongoose.Types.ObjectId.isValid(locationId)
    ? new mongoose.Types.ObjectId(locationId)
    : locationId;

  const [stats] = await Feedback.aggregate([
    {
      $match: {
        locationId: targetId,
        status: FEEDBACK_CONFIG.DEFAULT_STATUS,
      },
    },
    { $group: { _id: null, average: { $avg: '$rate' } } },
  ]);

  return stats ? Math.round(stats.average * 10) / 10 : 0;
};

export const createFeedback = async (req, res, next) => {
  let createdFeedback = null;

  try {
    const { locationId, userName, rate, description } = req.body;

    const location = await Location.findById(locationId);
    if (!location) {
      throw createHttpError(404, 'Location not found');
    }

    // 1. Створюємо відгук
    createdFeedback = await Feedback.create({
      locationId,
      owner: req.user._id,
      userName,
      rate,
      description,
      status: FEEDBACK_CONFIG.DEFAULT_STATUS,
    });

    // 2. Загальний рейтинг локації перераховуємо разом із додаванням відгуку
    const locationRate = await getLocationRate(location._id);

    // 3. Дописуємо id відгуку та оновлюємо рейтинг у локації
    await Location.findByIdAndUpdate(locationId, {
      $push: { feedbacksId: createdFeedback._id },
      $set: { rate: locationRate },
    });

    res.status(201).json({ data: createdFeedback });
  } catch (error) {
    // Відкат: якщо відгук встиг створитися, але далі сталася помилка — видаляємо його
    if (createdFeedback?._id) {
      await Feedback.findByIdAndDelete(createdFeedback._id).catch(() => {});
    }

    next(error);
  }
};

export const getLastReviews = async (req, res, next) => {
  try {
    const reviews = await Feedback.find({
      status: FEEDBACK_CONFIG.DEFAULT_STATUS,
    })
      .sort(FEEDBACK_CONFIG.SORT_ORDER)
      .limit(6)
      .populate({
        path: 'locationId',
        select: 'name locationType region',
      });

    res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
};
