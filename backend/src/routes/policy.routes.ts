import { Router } from 'express';
import { policyController } from '../controllers/policy.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPolicySchema, createQuoteSchema, updatePolicySchema, changeStatusSchema, endorsementSchema } from '../schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Read routes - all authenticated users ───────────────────
router.get('/', (req, res) => policyController.list(req, res));
router.get('/renewals/pending', (req, res) => policyController.getAllPendingRenewals(req, res));
router.get('/:id', (req, res) => policyController.getById(req, res));
router.get('/:id/versions', (req, res) => policyController.getVersions(req, res));
router.get('/:id/audit', (req, res) => policyController.getAudit(req, res));
router.get('/:id/endorsements', (req, res) => policyController.getEndorsements(req, res));
router.get('/:id/renewals', (req, res) => policyController.getRenewals(req, res));
router.get('/:id/transitions', (req, res) => policyController.getStatusTransitions(req, res));

// ─── Create & Update - Admin and Operations ──────────────────
router.post(
  '/',
  authorize('Admin', 'Operations'),
  validate(createPolicySchema),
  auditLog('CREATE', 'policy'),
  (req, res) => policyController.create(req, res)
);

router.put(
  '/:id',
  authorize('Admin', 'Operations'),
  validate(updatePolicySchema),
  auditLog('UPDATE', 'policy'),
  (req, res) => policyController.update(req, res)
);

router.patch(
  '/:id/status',
  authorize('Admin', 'Operations'),
  validate(changeStatusSchema),
  auditLog('STATUS_CHANGE', 'policy'),
  (req, res) => policyController.changeStatus(req, res)
);

// ─── Quote / Bind / Issue ────────────────────────────────────
router.post(
  '/quote',
  authorize('Admin', 'Operations', 'Underwriter'),
  validate(createQuoteSchema),
  auditLog('CREATE', 'quote'),
  (req, res) => policyController.createQuote(req, res)
);

router.post(
  '/calculate-premium',
  authorize('Admin', 'Operations', 'Underwriter'),
  (req, res) => policyController.calculatePremium(req, res)
);

router.post(
  '/:id/bind',
  authorize('Admin', 'Operations'),
  auditLog('STATUS_CHANGE', 'policy'),
  (req, res) => policyController.bindPolicy(req, res)
);

router.post(
  '/:id/issue',
  authorize('Admin', 'Operations'),
  auditLog('STATUS_CHANGE', 'policy'),
  (req, res) => policyController.issuePolicy(req, res)
);

// ─── Endorsements ────────────────────────────────────────────
router.post(
  '/:id/endorse',
  authorize('Admin', 'Operations'),
  validate(endorsementSchema),
  auditLog('CREATE', 'endorsement'),
  (req, res) => policyController.createEndorsement(req, res)
);

router.post(
  '/endorsements/:endorsementId/approve',
  authorize('Admin', 'Operations'),
  auditLog('UPDATE', 'endorsement'),
  (req, res) => policyController.approveEndorsement(req, res)
);

router.post(
  '/endorsements/:endorsementId/apply',
  authorize('Admin', 'Operations'),
  auditLog('UPDATE', 'endorsement'),
  (req, res) => policyController.applyEndorsement(req, res)
);

// ─── Renewals ────────────────────────────────────────────────
router.post(
  '/:id/renew',
  authorize('Admin', 'Operations'),
  auditLog('CREATE', 'renewal'),
  (req, res) => policyController.initiateRenewal(req, res)
);

router.post(
  '/renewals/:renewalId/accept',
  authorize('Admin', 'Operations'),
  auditLog('UPDATE', 'renewal'),
  (req, res) => policyController.acceptRenewal(req, res)
);

router.post(
  '/renewals/:renewalId/decline',
  authorize('Admin', 'Operations'),
  auditLog('UPDATE', 'renewal'),
  (req, res) => policyController.declineRenewal(req, res)
);

// ─── Reinstatement ───────────────────────────────────────────
router.post(
  '/:id/reinstate',
  authorize('Admin', 'Operations'),
  auditLog('STATUS_CHANGE', 'policy'),
  (req, res) => policyController.reinstatePolicy(req, res)
);

export default router;
