import { Router } from 'express';
import {
  getHRDashboard,
  getManagerDashboard,
  getEmployeeDashboard,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/hr', authorize('hr'), getHRDashboard);
router.get('/manager', authorize('manager', 'hr'), getManagerDashboard);
router.get('/employee', getEmployeeDashboard);

export default router;
