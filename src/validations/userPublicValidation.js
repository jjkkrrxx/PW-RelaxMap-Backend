import { Joi, Segments } from 'celebrate';

const objectId = Joi.string().hex().length(24);

export const userIdSchema = {
  [Segments.PARAMS]: Joi.object({
    userId: objectId.required(),
  }),
};

export const userLocationsQuerySchema = {
  [Segments.PARAMS]: Joi.object({
    userId: objectId.required(),
  }),
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(9),
  }),
};

// PATCH /api/users/current — зміна імені (як у моделі: 2–32 символи)
export const updateCurrentUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(2).max(32).required(),
  }),
};
