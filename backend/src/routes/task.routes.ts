import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../schemas';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/my', TaskController.myTasks);
router.get('/dashboard', TaskController.dashboard);
router.post('/check-overdue', authorize('Admin'), auditLog('UPDATE', 'Task'), TaskController.checkOverdue);
router.get('/', TaskController.list);
router.get('/:id', TaskController.getById);
router.post('/', authorize('Admin', 'Operations', 'Claims', 'Underwriter'), validate(createTaskSchema), auditLog('CREATE', 'Task'), TaskController.create);
router.put('/:id', validate(updateTaskSchema), auditLog('UPDATE', 'Task'), TaskController.update);
router.delete('/:id', authorize('Admin'), auditLog('DELETE', 'Task'), TaskController.remove);

export default router;
