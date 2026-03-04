import { Router } from 'express';
import { underwritingController } from '../controllers/underwriting.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { evaluateUnderwritingSchema, overrideUnderwritingSchema } from '../schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read routes
router.get('/', (req, res) => underwritingController.list(req, res));
router.get('/rules', (req, res) => underwritingController.getRules(req, res));
router.get('/:id', (req, res) => underwritingController.getById(req, res));
router.get('/policy/:policyId', (req, res) => underwritingController.getByPolicyId(req, res));

// Evaluate and override - Admin and Underwriter only
router.post(
  '/evaluate',
  authorize('Admin', 'Underwriter'),
  validate(evaluateUnderwritingSchema),
  auditLog('EVALUATE', 'underwriting'),
  (req, res) => underwritingController.evaluate(req, res)
);

router.patch(
  '/:id/override',
  authorize('Admin', 'Underwriter'),
  validate(overrideUnderwritingSchema),
  auditLog('OVERRIDE', 'underwriting'),
  (req, res) => underwritingController.override(req, res)
);

export default router;
