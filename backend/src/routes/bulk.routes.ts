import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { bulkOperationSchema } from '../schemas';
import { BulkOperation, BulkOperationResult } from '../models/product.model';
import fs from 'fs';
import path from 'path';

const router = Router();

const policiesPath = path.resolve(__dirname, '../../mock-data/policies.json');
const claimsPath = path.resolve(__dirname, '../../mock-data/claims.json');
const invoicesPath = path.resolve(__dirname, '../../mock-data/invoices.json');

// In-memory operations store
const operations: BulkOperation[] = [];

function loadJSON(filePath: string): any[] {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { return []; }
}
function saveJSON(filePath: string, data: any[]) { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); }

// All routes require authentication
router.use(authenticate);

// Start bulk operation (Admin/Operations only)
router.post('/:operation', authorize('Admin', 'Operations'), validate(bulkOperationSchema), auditLog('BULK', 'BulkOperation'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const { operation } = req.params;
  const { entityIds, parameters } = req.body;

  const op: BulkOperation = {
    id: `BULK-${Date.now()}`,
    type: operation.toUpperCase().replace(/-/g, '_') as any,
    status: 'Processing',
    totalItems: entityIds.length,
    processedItems: 0,
    successCount: 0,
    failureCount: 0,
    results: [],
    parameters,
    startedAt: new Date().toISOString(),
    createdBy: user.userId,
  };

  // Process synchronously (mock — in production would be async job)
  switch (operation) {
    case 'renewal': {
      const policies = loadJSON(policiesPath);
      entityIds.forEach((id: string) => {
        const policy = policies.find((p: any) => p.id === id);
        if (!policy) {
          op.results.push({ entityId: id, success: false, message: 'Policy not found' });
          op.failureCount++;
        } else if (policy.status !== 'Active' && policy.status !== 'Renewal_Pending') {
          op.results.push({ entityId: id, success: false, message: `Cannot renew — status is ${policy.status}` });
          op.failureCount++;
        } else {
          policy.status = 'Renewal_Pending';
          policy.updatedAt = new Date().toISOString();
          op.results.push({ entityId: id, success: true, message: 'Marked for renewal' });
          op.successCount++;
        }
        op.processedItems++;
      });
      saveJSON(policiesPath, policies);
      break;
    }
    case 'cancel': {
      const policies = loadJSON(policiesPath);
      entityIds.forEach((id: string) => {
        const policy = policies.find((p: any) => p.id === id);
        if (!policy) {
          op.results.push({ entityId: id, success: false, message: 'Policy not found' });
          op.failureCount++;
        } else if (['Cancelled', 'Expired'].includes(policy.status)) {
          op.results.push({ entityId: id, success: false, message: `Already ${policy.status}` });
          op.failureCount++;
        } else {
          policy.status = 'Cancelled';
          policy.updatedAt = new Date().toISOString();
          op.results.push({ entityId: id, success: true, message: 'Cancelled' });
          op.successCount++;
        }
        op.processedItems++;
      });
      saveJSON(policiesPath, policies);
      break;
    }
    case 'claim-update': {
      const claims = loadJSON(claimsPath);
      const newStatus = parameters?.status;
      if (!newStatus) {
        op.status = 'Failed';
        op.results.push({ entityId: '', success: false, message: 'parameters.status is required' });
        break;
      }
      entityIds.forEach((id: string) => {
        const claim = claims.find((c: any) => c.id === id);
        if (!claim) {
          op.results.push({ entityId: id, success: false, message: 'Claim not found' });
          op.failureCount++;
        } else {
          claim.status = newStatus;
          claim.updatedAt = new Date().toISOString();
          op.results.push({ entityId: id, success: true, message: `Status updated to ${newStatus}` });
          op.successCount++;
        }
        op.processedItems++;
      });
      saveJSON(claimsPath, claims);
      break;
    }
    case 'invoice': {
      const invoices = loadJSON(invoicesPath);
      entityIds.forEach((id: string) => {
        const invoice = {
          id: `INV-BULK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          billingAccountId: id,
          policyId: id,
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          amount: parameters?.amount || 1000,
          amountPaid: 0,
          dueDate: parameters?.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'Pending',
          lineItems: [{ description: 'Premium installment', amount: parameters?.amount || 1000, type: 'premium' }],
          issuedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        invoices.push(invoice);
        op.results.push({ entityId: id, success: true, message: `Invoice ${invoice.invoiceNumber} generated` });
        op.successCount++;
        op.processedItems++;
      });
      saveJSON(invoicesPath, invoices);
      break;
    }
    default:
      op.status = 'Failed';
      op.results.push({ entityId: '', success: false, message: `Unknown operation: ${operation}` });
  }

  op.status = op.failureCount === op.totalItems ? 'Failed' : op.failureCount > 0 ? 'Partial' : 'Completed';
  op.completedAt = new Date().toISOString();
  operations.push(op);

  res.json({ success: true, data: op });
});

// Get operation status
router.get('/:operationId/status', (req: Request, res: Response) => {
  const op = operations.find(o => o.id === req.params.operationId);
  if (!op) return res.status(404).json({ success: false, message: 'Operation not found' });
  res.json({ success: true, data: op });
});

// List recent operations
router.get('/', (_req: Request, res: Response) => {
  const recent = operations.slice(-20).reverse();
  res.json({ success: true, data: recent });
});

export default router;
