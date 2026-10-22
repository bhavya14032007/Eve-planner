import { Router } from 'express';
import {
  getPackages,
  getPackageDetail,
  calculateCustomPackagePrice,
} from '../controllers/packagesController';
import { seedDatabase } from '../services/seedService';

const router = Router();

router.get('/seed', async (_req, res, next) => {
  try {
    const result = await seedDatabase();
    res.json({
      success: true,
      message: 'Demo celebration packages and categories seeded successfully!',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/seed', async (_req, res, next) => {
  try {
    const result = await seedDatabase();
    res.json({
      success: true,
      message: 'Demo celebration packages and categories seeded successfully!',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', getPackages);
router.post('/calculate-price', calculateCustomPackagePrice);
router.get('/:idOrSlug', getPackageDetail);

export default router;
