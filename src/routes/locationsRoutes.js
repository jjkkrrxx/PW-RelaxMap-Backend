import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { uploadLocationImages } from '../middleware/multer.js';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
} from '../controllers/locationController.js';
import {
  locationQuerySchema,
  locationIdSchema,
  createLocationSchema,
} from '../validations/locationValidation.js';

const router = Router();


export default router;