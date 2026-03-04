import { Request, Response } from 'express';
import { billingService } from '../services/billing.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class BillingController {
  // ── Accounts ──

  async listAccounts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as string | undefined,
        policyId: req.query.policyId as string | undefined,
        customerId: req.query.customerId as string | undefined,
      };
      const result = billingService.listAccounts(page, limit, filters);
      paginatedResponse(res, result.data, result.total, page, limit, 'Billing accounts retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const account = billingService.getAccount(req.params.id);
      if (!account) {
        errorResponse(res, 'Billing account not found', 404);
        return;
      }
      successResponse(res, account, 'Billing account retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getAccountByPolicy(req: Request, res: Response): Promise<void> {
    try {
      const account = billingService.getAccountByPolicy(req.params.policyId);
      if (!account) {
        errorResponse(res, 'No billing account for this policy', 404);
        return;
      }
      successResponse(res, account, 'Billing account retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const { policyId, customerId, paymentFrequency } = req.body;
      const missing: string[] = [];
      if (!policyId) missing.push('policyId');
      if (!customerId) missing.push('customerId');
      if (!paymentFrequency) missing.push('paymentFrequency');
      if (missing.length) {
        errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
        return;
      }
      const account = await billingService.createAccount(req.body);
      successResponse(res, account, 'Billing account created', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const account = await billingService.updateAccount(req.params.id, req.body);
      if (!account) {
        errorResponse(res, 'Billing account not found', 404);
        return;
      }
      successResponse(res, account, 'Billing account updated');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getOverdue(req: Request, res: Response): Promise<void> {
    try {
      const accounts = billingService.getOverdueAccounts();
      successResponse(res, accounts, `Found ${accounts.length} overdue account(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ── Invoices ──

  async listInvoices(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        billingAccountId: req.query.billingAccountId as string | undefined,
        policyId: req.query.policyId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const result = billingService.listInvoices(page, limit, filters);
      paginatedResponse(res, result.data, result.total, page, limit, 'Invoices retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const invoice = billingService.getInvoice(req.params.id);
      if (!invoice) {
        errorResponse(res, 'Invoice not found', 404);
        return;
      }
      successResponse(res, invoice, 'Invoice retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getInvoicesByAccount(req: Request, res: Response): Promise<void> {
    try {
      const invoices = billingService.getInvoicesByAccount(req.params.accountId);
      successResponse(res, invoices, `Found ${invoices.length} invoice(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { billingAccountId, amount, dueDate } = req.body;
      const missing: string[] = [];
      if (!billingAccountId) missing.push('billingAccountId');
      if (amount === undefined || amount === null) missing.push('amount');
      if (!dueDate) missing.push('dueDate');
      if (missing.length) {
        errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
        return;
      }
      if (typeof amount !== 'number' || amount <= 0) {
        errorResponse(res, 'amount must be a positive number', 400);
        return;
      }
      const invoice = await billingService.createInvoice(req.body);
      successResponse(res, invoice, 'Invoice created', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async voidInvoice(req: Request, res: Response): Promise<void> {
    try {
      const invoice = await billingService.voidInvoice(req.params.id);
      if (!invoice) {
        errorResponse(res, 'Invoice not found', 404);
        return;
      }
      successResponse(res, invoice, 'Invoice voided');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // ── Payments ──

  async listPayments(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        billingAccountId: req.query.billingAccountId as string | undefined,
        policyId: req.query.policyId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const result = billingService.listPayments(page, limit, filters);
      paginatedResponse(res, result.data, result.total, page, limit, 'Payments retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const payment = billingService.getPayment(req.params.id);
      if (!payment) {
        errorResponse(res, 'Payment not found', 404);
        return;
      }
      successResponse(res, payment, 'Payment retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getPaymentsByAccount(req: Request, res: Response): Promise<void> {
    try {
      const payments = billingService.getPaymentsByAccount(req.params.accountId);
      successResponse(res, payments, `Found ${payments.length} payment(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async recordPayment(req: Request, res: Response): Promise<void> {
    try {
      const { billingAccountId, invoiceId, amount, method } = req.body;
      const missing: string[] = [];
      if (!billingAccountId) missing.push('billingAccountId');
      if (!invoiceId) missing.push('invoiceId');
      if (amount === undefined || amount === null) missing.push('amount');
      if (!method) missing.push('method');
      if (missing.length) {
        errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
        return;
      }
      if (typeof amount !== 'number' || amount <= 0) {
        errorResponse(res, 'amount must be a positive number', 400);
        return;
      }
      const payment = await billingService.recordPayment(req.body, req.user!.userId);
      successResponse(res, payment, 'Payment recorded', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // ── Ledger ──

  async getLedger(req: Request, res: Response): Promise<void> {
    try {
      const entries = billingService.getLedger(req.params.accountId);
      successResponse(res, entries, `Found ${entries.length} ledger entry(ies)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ── Installment Plan ──

  async calculateInstallments(req: Request, res: Response): Promise<void> {
    try {
      const { totalPremium, frequency, startDate } = req.body;
      if (!totalPremium || !frequency || !startDate) {
        errorResponse(res, 'totalPremium, frequency, and startDate are required', 400);
        return;
      }
      const plan = billingService.calculateInstallments(totalPremium, frequency, startDate);
      successResponse(res, plan, 'Installment plan calculated');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // ── Summary ──

  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = billingService.getSummary();
      successResponse(res, summary, 'Billing summary retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}

export const billingController = new BillingController();
