import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  getMyProfile,
  updateMyProfile,
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

// Self routes
router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);

// Management routes
router.get('/', authorize('hr', 'manager'), getEmployees);
router.get('/:id', authorize('hr', 'manager', 'employee'), getEmployeeById);
router.post('/', authorize('hr'), createEmployee);
router.put('/:id', authorize('hr'), updateEmployee);
router.delete('/:id', authorize('hr'), deactivateEmployee);

export default router;
