import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

const objectId = Joi.string().hex().length(24);

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const createLocationSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(3).max(96).required(),
    locationType: Joi.string().trim().max(64).required(),
    region: Joi.string().trim().max(64).required(),
    description: Joi.string().trim().min(20).max(6000).required(),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lon: Joi.number().required(),
    }).required(),
  }),
};

export const updateLocationSchema = {
  [Segments.PARAMS]: Joi.object({
    locationId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(3).max(96),
    locationType: Joi.string().trim().max(64),
    region: Joi.string().trim().max(64),
    description: Joi.string().trim().min(20).max(6000),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lon: Joi.number().required(),
    }),
  }),
};

export const locationQuerySchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(9),
    region: Joi.string().trim(),
    type: Joi.array().items(Joi.string().trim()).single(),
    search: Joi.string().trim().max(96).allow(''),
    sort: Joi.string().valid(
      'popular',
      'rating',
      'new',
      'name-asc',
      'name-desc',
    ),
  }),
};

export const locationIdSchema = {
  [Segments.PARAMS]: Joi.object({
    locationId: objectId.required(),
  }),
};
