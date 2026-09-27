export const parseCoordinates = (req, res, next) => {
  if (!req.body) {
    return next();
  }

  if (req.body.coordinates) {
    req.body.coordinates = JSON.parse(req.body.coordinates);
  }

  next();
};
