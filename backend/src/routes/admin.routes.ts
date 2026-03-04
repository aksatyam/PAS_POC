import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas';

const router = Router();

// All routes require authentication + Admin role
router.use(authenticate);
router.use(authorize('Admin'));

router.get('/users', (req, res) => adminController.listUsers(req, res));
router.post('/users', validate(createUserSchema), auditLog('CREATE', 'User'), (req, res) => adminController.createUser(req, res));
router.put('/users/:id', validate(updateUserSchema), auditLog('UPDATE', 'User'), (req, res) => adminController.updateUser(req, res));
router.patch('/users/:id/deactivate', auditLog('DEACTIVATE', 'User'), (req, res) => adminController.deactivateUser(req, res));
router.get('/logs', authorize('Admin', 'Operations'), (req, res) => adminController.getSystemLogs(req, res));

export default router;
