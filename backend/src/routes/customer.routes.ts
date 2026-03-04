import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from '../schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read routes - all authenticated users
router.get('/', (req, res) => customerController.list(req, res));
router.get('/search', (req, res) => customerController.search(req, res));
router.get('/:id', (req, res) => customerController.getById(req, res));
router.get('/:id/policies', (req, res) => customerController.getWithPolicies(req, res));

// Mutation routes - Admin and Operations only
router.post(
  '/',
  authorize('Admin', 'Operations'),
  validate(createCustomerSchema),
  auditLog('CREATE', 'customer'),
  (req, res) => customerController.create(req, res)
);

router.put(
  '/:id',
  authorize('Admin', 'Operations'),
  validate(updateCustomerSchema),
  auditLog('UPDATE', 'customer'),
  (req, res) => customerController.update(req, res)
);

router.delete(
  '/:id',
  authorize('Admin', 'Operations'),
  auditLog('DELETE', 'customer'),
  (req, res) => customerController.delete(req, res)
);

export default router;
