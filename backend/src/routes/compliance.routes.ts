import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createComplianceSchema, updateComplianceSchema } from '../schemas';
import { ComplianceRequirement } from '../models/product.model';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataPath = path.resolve(__dirname, '../../mock-data/compliance.json');

function loadCompliance(): ComplianceRequirement[] {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf-8')); } catch { return []; }
}
function saveCompliance(data: ComplianceRequirement[]) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }

// All routes require authentication
router.use(authenticate);

// List all compliance requirements
router.get('/requirements', (_req: Request, res: Response) => {
  const reqs = loadCompliance();
  res.json({ success: true, data: reqs });
});

// Get summary
router.get('/summary', (_req: Request, res: Response) => {
  const reqs = loadCompliance();
  const summary = {
    total: reqs.length,
    compliant: reqs.filter(r => r.status === 'Compliant').length,
    nonCompliant: reqs.filter(r => r.status === 'Non-Compliant').length,
    due: reqs.filter(r => r.status === 'Due').length,
    inProgress: reqs.filter(r => r.status === 'In Progress').length,
    byCategory: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    overdueCount: reqs.filter(r => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== 'Compliant').length,
  };
  reqs.forEach(r => {
    summary.byCategory[r.category] = (summary.byCategory[r.category] || 0) + 1;
    summary.byPriority[r.priority] = (summary.byPriority[r.priority] || 0) + 1;
  });
  res.json({ success: true, data: summary });
});

// Get single requirement
router.get('/requirements/:id', (req: Request, res: Response) => {
  const reqs = loadCompliance();
  const item = reqs.find(r => r.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Requirement not found' });
  res.json({ success: true, data: item });
});

// Create compliance requirement (Admin only)
router.post('/requirements', authorize('Admin'), validate(createComplianceSchema), auditLog('CREATE', 'Compliance'), (req: Request, res: Response) => {
  const reqs = loadCompliance();
  const item: ComplianceRequirement = {
    id: `CMP-${String(reqs.length + 1).padStart(3, '0')}`,
    name: req.body.name,
    description: req.body.description || '',
    category: req.body.category || 'Regulatory',
    authority: req.body.authority || '',
    status: req.body.status || 'Due',
    dueDate: req.body.dueDate,
    assignedTo: req.body.assignedTo,
    notes: req.body.notes,
    priority: req.body.priority || 'Medium',
    recurrence: req.body.recurrence || 'Annual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reqs.push(item);
  saveCompliance(reqs);
  res.status(201).json({ success: true, data: item });
});

// Update compliance requirement (Admin/Operations)
router.put('/requirements/:id', authorize('Admin', 'Operations'), validate(updateComplianceSchema), auditLog('UPDATE', 'Compliance'), (req: Request, res: Response) => {
  const reqs = loadCompliance();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Requirement not found' });

  const updates = req.body;
  if (updates.status === 'Compliant' && !reqs[idx].completedDate) {
    updates.completedDate = new Date().toISOString();
  }
  reqs[idx] = { ...reqs[idx], ...updates, id: reqs[idx].id, updatedAt: new Date().toISOString() };
  saveCompliance(reqs);
  res.json({ success: true, data: reqs[idx] });
});

// Delete compliance requirement (Admin only)
router.delete('/requirements/:id', authorize('Admin'), auditLog('DELETE', 'Compliance'), (req: Request, res: Response) => {
  let reqs = loadCompliance();
  const idx = reqs.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Requirement not found' });

  reqs.splice(idx, 1);
  saveCompliance(reqs);
  res.json({ success: true, message: 'Requirement removed' });
});

export default router;
