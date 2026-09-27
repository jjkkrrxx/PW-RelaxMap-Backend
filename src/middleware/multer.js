import createHttpError from 'http-errors';
import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpg', 'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(createHttpError(400, 'Only images allowed'), false);
    }
  },
});
