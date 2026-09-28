import { notImplemented } from '../utils/notImplemented.js';
import { Location } from '../models/location.js';

export const getLocations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, region, type, search } = req.query;

    const filter = {};

    if (region) {
      filter.region = region;
    }

    if (type && type !== 'popular') {
      filter.locationType = type;
    }

    if (search) {
      filter.name = {
        $regex: search,
        $options: 'i',
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    let query = Location.find(filter);

    if (type === 'popular') {
      query = query.sort({ rate: -1 });
    }

    const [locations, total] = await Promise.all([
      query.skip(skip).limit(type === 'popular' ? 6 : Number(limit)),
      Location.countDocuments(filter),
    ]);

    res.status(200).json({
      data: locations,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationById = notImplemented;

export const createLocation = notImplemented;

export const updateLocation = notImplemented;
