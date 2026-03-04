import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUWRuleSchema, updateUWRuleSchema, resolveReferralSchema, escalateReferralSchema, updateAuthoritySchema } from '../schemas';
import { referralEngine } from '../services/referralEngine';
import { UnderwritingRule } from '../models';
import { successResponse, errorResponse } from '../utils/response';
import { generateId } from '../utils/id-generator';
import fs from 'fs';
import path from 'path';

const RULES_PATH = path.resolve(__dirname, '../../mock-data/uwRules.json');

function loadRules(): UnderwritingRule[] {
  try { return JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8')); } catch { return []; }
}
function saveRules(rules: UnderwritingRule[]) {
  fs.writeFileSync(RULES_PATH, JSON.stringify(rules, null, 2));
}

const router = Router();
router.use(authenticate);

// --- Configurable Rules CRUD ---
router.get('/rules', (_req: Request, res: Response) => {
  try {
    successResponse(res, loadRules(), 'UW rules retrieved');
  } catch (e: any) { errorResponse(res, e.message, 500); }
});

router.post('/rules', authorize('Admin'), validate(createUWRuleSchema), auditLog('CREATE', 'UWRule'), (req: Request, res: Response) => {
  try {
    const rules = loadRules();
    const newRule: UnderwritingRule = {
      id: generateId('R'),
      ...req.body,
      isActive: req.body.isActive ?? true,
      priority: req.body.priority ?? rules.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    rules.push(newRule);
    saveRules(rules);
    successResponse(res, newRule, 'Rule created', 201);
  } catch (e: any) { errorResponse(res, e.message, 400); }
});

router.put('/rules/:id', authorize('Admin'), validate(updateUWRuleSchema), auditLog('UPDATE', 'UWRule'), (req: Request, res: Response) => {
  try {
    const rules = loadRules();
    const idx = rules.findIndex((r) => r.id === req.params.id);
    if (idx === -1) { errorResponse(res, 'Rule not found', 404); return; }
    rules[idx] = { ...rules[idx], ...req.body, id: rules[idx].id, updatedAt: new Date().toISOString() };
    saveRules(rules);
    successResponse(res, rules[idx], 'Rule updated');
  } catch (e: any) { errorResponse(res, e.message, 400); }
});

router.delete('/rules/:id', authorize('Admin'), auditLog('DELETE', 'UWRule'), (req: Request, res: Response) => {
  try {
    let rules = loadRules();
    const exists = rules.find((r) => r.id === req.params.id);
    if (!exists) { errorResponse(res, 'Rule not found', 404); return; }
    rules = rules.filter((r) => r.id !== req.params.id);
    saveRules(rules);
    successResponse(res, null, 'Rule deleted');
  } catch (e: any) { errorResponse(res, e.message, 400); }
});

// --- Referrals ---
router.get('/referrals', (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const data = status ? referralEngine.getReferrals(status as any) : referralEngine.getReferrals();
    successResponse(res, data, 'Referrals retrieved');
  } catch (e: any) { errorResponse(res, e.message, 500); }
});

router.get('/referrals/summary', (_req: Request, res: Response) => {
  try {
    successResponse(res, referralEngine.getSummary(), 'Referral summary');
  } catch (e: any) { errorResponse(res, e.message, 500); }
});

router.get('/referrals/my', (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    successResponse(res, referralEngine.getReferralsByAssignee(userId), 'My referrals');
  } catch (e: any) { errorResponse(res, e.message, 500); }
});

router.get('/referrals/:id', (req: Request, res: Response) => {
  try {
    const ref = referralEngine.getReferralById(req.params.id);
    if (!ref) { errorResponse(res, 'Referral not found', 404); return; }
    successResponse(res, ref, 'Referral retrieved');
  } catch (e: any) { errorResponse(res, e.message, 500); }
});

router.put('/referrals/:id/resolve', authorize('Admin', 'Underwriter'), validate(resolveReferralSchema), auditLog('RESOLVE', 'Referral'), (req: Request, res: Response) => {
  try {
    const { resolution, decision } = req.body;
    const ref = referralEngine.resolveReferral(req.params.id, resolution, decision, req.user!.userId);
    successResponse(res, ref, 'Referral resolved');
  } catch (e: any) { errorResponse(res, e.message, 400); }
});

router.put('/referrals/:id/escalate', authorize('Admin', 'Underwriter'), validate(escalateReferralSchema), auditLog('ESCALATE', 'Referral'), (req: Request, res: Response) => {
  try {
    const { escalateTo } = req.body;
    const ref = referralEngine.escalateReferral(req.params.id, escalateTo);
    successResponse(res, ref, 'Referral escalated');
  } catch (e: any) { errorResponse(res, e.message, 400); }
});

// --- Authority Management ---
router.get('/authority', authorize('Admin'), (_req: Request, res: Response) => {
  try {
    successResponse(res, referralEngine.getAuthorities(), 'Authorities retrieved');
  } catch (e: any) { errorResponse(res, e.message, 500); }
});

router.get('/authority/:userId', authorize('Admin', 'Underwriter'), (req: Request, res: Response) => {
  try {
    const auth = referralEngine.getAuthorityByUser(req.params.userId);
    if (!auth) { errorResponse(res, 'No authority record found', 404); return; }
    successResponse(res, auth, 'Authority retrieved');
  } catch (e: any) { errorResponse(res, e.message, 500); }
});

router.put('/authority/:userId', authorize('Admin'), validate(updateAuthoritySchema), auditLog('UPDATE', 'Authority'), (req: Request, res: Response) => {
  try {
    const auth = referralEngine.setAuthority({
      ...req.body,
      userId: req.params.userId,
      updatedBy: req.user!.userId,
    });
    successResponse(res, auth, 'Authority updated');
  } catch (e: any) { errorResponse(res, e.message, 400); }
});

export default router;
