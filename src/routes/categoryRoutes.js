import { Router } from 'express';
import { getCategoriesAndRegions } from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategoriesAndRegions);

export default router;
