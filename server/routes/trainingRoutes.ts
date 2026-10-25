import { Router } from 'express';
import {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  updateProgress,
} from '../controllers/trainingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getTrainings);
router.post('/', authorize('hr', 'manager'), createTraining);
router.put('/:id', authorize('hr', 'manager'), updateTraining);
router.delete('/:id', authorize('hr', 'manager'), deleteTraining);
router.patch('/:id/progress', updateProgress);

export default router;
