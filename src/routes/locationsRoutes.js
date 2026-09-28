import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
} from '../controllers/locationController.js';
import {
  locationQuerySchema,
  locationIdSchema,
  updateLocationSchema,
  createLocationSchema,
} from '../validations/locationValidation.js';
import { upload } from '../middleware/multer.js';
import { parseCoordinates } from '../middleware/parseCoordinates.js';

const router = Router();

router.get('/locations', celebrate(locationQuerySchema), getLocations);
router.get('/:locationId', celebrate(locationIdSchema), getLocationById);

router.post(
  '/',
  authenticate,
  upload.single('images'),
  parseCoordinates,
  celebrate(createLocationSchema),
  createLocation,
);

router.patch(
  '/:locationId',
  authenticate,
  upload.single('images'),
  parseCoordinates,
  celebrate(updateLocationSchema),
  updateLocation,
);

export default router;
