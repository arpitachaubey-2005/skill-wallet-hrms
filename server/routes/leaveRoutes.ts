import { Router } from 'express';
import {
  applyLeave,
  getLeaves,
  getMyLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
} from '../controllers/leaveController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', applyLeave);
router.get('/', getLeaves);
router.get('/my', getMyLeaves);
router.patch('/:id/approve', authorize('hr', 'manager'), approveLeave);
router.patch('/:id/reject', authorize('hr', 'manager'), rejectLeave);
router.patch('/:id/cancel', cancelLeave);

export default router;
