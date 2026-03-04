import { Router } from 'express';
import { claimController } from '../controllers/claim.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerClaimSchema, submitFNOLSchema, claimStatusSchema, settleClaimSchema, adjudicationSchema, reserveSchema, mitigationSchema } from '../schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── FNOL ──────────────────────────────────────────────────
router.get('/fnol', (req, res) => claimController.listFNOLs(req, res));
router.get('/fnol/:fnolId', (req, res) => claimController.getFNOL(req, res));

router.post(
  '/fnol',
  authorize('Admin', 'Claims', 'Operations'),
  validate(submitFNOLSchema),
  auditLog('CREATE', 'fnol'),
  (req, res) => claimController.submitFNOL(req, res)
);

router.post(
  '/fnol/:fnolId/process',
  authorize('Admin', 'Claims'),
  auditLog('UPDATE', 'fnol'),
  (req, res) => claimController.processFNOL(req, res)
);

// ─── Adjudication board ────────────────────────────────────
router.get('/adjudication', (req, res) => claimController.listByAdjudication(req, res));

// ─── Policy claims lookup ──────────────────────────────────
router.get('/policy/:policyId', (req, res) => claimController.getByPolicy(req, res));

// ─── Read routes ───────────────────────────────────────────
router.get('/', (req, res) => claimController.list(req, res));
router.get('/:id', (req, res) => claimController.getById(req, res));
router.get('/:id/reserve-history', (req, res) => claimController.getReserveHistory(req, res));
router.get('/:id/fraud-score', (req, res) => claimController.getFraudAssessment(req, res));
router.get('/:id/mitigations', (req, res) => claimController.getMitigations(req, res));

// ─── Mutation routes - Admin and Claims ────────────────────
router.post(
  '/',
  authorize('Admin', 'Claims'),
  validate(registerClaimSchema),
  auditLog('CREATE', 'claim'),
  (req, res) => claimController.register(req, res)
);

router.patch(
  '/:id/status',
  authorize('Admin', 'Claims'),
  validate(claimStatusSchema),
  auditLog('STATUS_CHANGE', 'claim'),
  (req, res) => claimController.updateStatus(req, res)
);

router.post(
  '/:id/settle',
  authorize('Admin', 'Claims'),
  validate(settleClaimSchema),
  auditLog('SETTLEMENT', 'claim'),
  (req, res) => claimController.settle(req, res)
);

// ─── Adjudication ──────────────────────────────────────────
router.put(
  '/:id/adjudicate',
  authorize('Admin', 'Claims'),
  validate(adjudicationSchema),
  auditLog('UPDATE', 'claim'),
  (req, res) => claimController.updateAdjudication(req, res)
);

// ─── Reserves ──────────────────────────────────────────────
router.put(
  '/:id/reserve',
  authorize('Admin', 'Claims'),
  validate(reserveSchema),
  auditLog('UPDATE', 'claim'),
  (req, res) => claimController.setReserve(req, res)
);

// ─── Loss Mitigation ──────────────────────────────────────
router.post(
  '/:id/mitigation',
  authorize('Admin', 'Claims'),
  validate(mitigationSchema),
  auditLog('CREATE', 'mitigation'),
  (req, res) => claimController.addMitigation(req, res)
);

router.patch(
  '/mitigations/:mitigationId/status',
  authorize('Admin', 'Claims'),
  auditLog('UPDATE', 'mitigation'),
  (req, res) => claimController.updateMitigationStatus(req, res)
);

export default router;
