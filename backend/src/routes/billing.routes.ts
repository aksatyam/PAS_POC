import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBillingAccountSchema, createInvoiceSchema, recordPaymentSchema } from '../schemas';

const router = Router();

// All billing routes require authentication
router.use(authenticate);

// Summary
router.get('/summary', billingController.getSummary);
router.get('/overdue', billingController.getOverdue);

// Installment calculator
router.post('/installment-plan', billingController.calculateInstallments);

// Accounts
router.get('/accounts', billingController.listAccounts);
router.get('/accounts/:id', billingController.getAccount);
router.get('/accounts/policy/:policyId', billingController.getAccountByPolicy);
router.post(
  '/accounts',
  authorize('Admin', 'Operations'),
  validate(createBillingAccountSchema),
  auditLog('CREATE', 'billing_account'),
  billingController.createAccount
);
router.put(
  '/accounts/:id',
  authorize('Admin', 'Operations'),
  auditLog('UPDATE', 'billing_account'),
  billingController.updateAccount
);

// Invoices
router.get('/invoices', billingController.listInvoices);
router.get('/invoices/:id', billingController.getInvoice);
router.get('/invoices/account/:accountId', billingController.getInvoicesByAccount);
router.post(
  '/invoices',
  authorize('Admin', 'Operations'),
  validate(createInvoiceSchema),
  auditLog('CREATE', 'invoice'),
  billingController.createInvoice
);
router.put(
  '/invoices/:id/void',
  authorize('Admin'),
  auditLog('VOID', 'invoice'),
  billingController.voidInvoice
);

// Payments
router.get('/payments', billingController.listPayments);
router.get('/payments/:id', billingController.getPayment);
router.get('/payments/account/:accountId', billingController.getPaymentsByAccount);
router.post(
  '/payments',
  authorize('Admin', 'Operations'),
  validate(recordPaymentSchema),
  auditLog('PAYMENT', 'payment'),
  billingController.recordPayment
);

// Ledger
router.get('/ledger/:accountId', billingController.getLedger);

export default router;
