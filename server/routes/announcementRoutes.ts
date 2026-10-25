import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post('/', authorize('hr', 'manager'), createAnnouncement);
router.put('/:id', authorize('hr', 'manager'), updateAnnouncement);
router.delete('/:id', authorize('hr', 'manager'), deleteAnnouncement);

export default router;
