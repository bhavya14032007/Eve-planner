import { Router } from 'express';
import {
  getCategories,
  getFeaturedServices,
  getServices,
  getServiceDetail,
} from '../controllers/servicesController';

const router = Router();

router.get('/categories', getCategories);
router.get('/featured', getFeaturedServices);
router.get('/', getServices);
router.get('/:idOrSlug', getServiceDetail);

export default router;
