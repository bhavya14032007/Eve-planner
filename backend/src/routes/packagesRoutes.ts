import { Router } from 'express';
import {
  getPackages,
  getPackageDetail,
  calculateCustomPackagePrice,
} from '../controllers/packagesController';

const router = Router();

router.get('/', getPackages);
router.post('/calculate-price', calculateCustomPackagePrice);
router.get('/:idOrSlug', getPackageDetail);

export default router;
