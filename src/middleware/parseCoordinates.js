import createHttpError from 'http-errors';

export const parseCoordinates = (req, res, next) => {
  const { coordinates } = req.body;

  // поле не передали або передали порожнім — координат немає
  if (coordinates === undefined || coordinates === '') {
    delete req.body.coordinates;
    return next();
  }

  // у multipart координати приходять JSON-рядком
  if (typeof coordinates === 'string') {
    try {
      req.body.coordinates = JSON.parse(coordinates);
    } catch {
      return next(createHttpError(400, 'coordinates must be valid JSON'));
    }
  }

  next();
};
