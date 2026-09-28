import createHttpError from 'http-errors';
import { Feedback } from '../models/feedback.js';
import { Location } from '../models/location.js';

const FEEDBACK_CONFIG = {
  DEFAULT_STATUS: 'approved',
  SORT_ORDER: { _id: -1 },
  PARSE_INT_RADIX: 10,
};

export const getFeedbacks = async (req, res, next) => {
  try {
    const { locationId, page, limit } = req.query;

    const filter = { status: FEEDBACK_CONFIG.DEFAULT_STATUS };

    if (locationId) {
      filter.locationId = locationId;
    }

    const currentPage = parseInt(page, FEEDBACK_CONFIG.PARSE_INT_RADIX);
    const currentLimit = parseInt(limit, FEEDBACK_CONFIG.PARSE_INT_RADIX);
    const skip = (currentPage - 1) * currentLimit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .sort(FEEDBACK_CONFIG.SORT_ORDER)
        .skip(skip)
        .limit(currentLimit)
        .populate({
          path: 'locationId',
          select: 'name locationType region',
        })
        .populate('owner', 'name avatar'),
      Feedback.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / currentLimit);

    res.status(200).json({
      data: feedbacks,
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const createFeedback = async (req, res, next) => {
  try {
    const { locationId, userName, rate, description } = req.body;

    const location = await Location.findById(locationId);
    if (!location) {
      throw createHttpError(404, 'Location not found');
    }

    const feedback = await Feedback.create({
      locationId,
      owner: req.user._id,
      userName,
      rate,
      description,
    });

    await Location.findByIdAndUpdate(locationId, {
      $push: { feedbacksId: feedback._id },
    });

    res.status(201).json({ data: feedback });
  } catch (error) {
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
