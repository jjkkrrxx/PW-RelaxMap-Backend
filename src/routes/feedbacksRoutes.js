import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getFeedbacks,
  createFeedback,
  getLastReviews,
} from '../controllers/feedbackController.js';
import {
  feedbackQuerySchema,
  createFeedbackSchema,
} from '../validations/feedbackValidation.js';

const router = Router();

router.get('/last', getLastReviews);
router.get('/', celebrate(feedbackQuerySchema), getFeedbacks);
router.post('/', authenticate, celebrate(createFeedbackSchema), createFeedback);

export default router;