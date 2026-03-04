import { Request, Response } from 'express';
import { policyService } from '../services/policy.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class PolicyController {
  // ─── CRUD ──────────────────────────────────────────────────────

  async create(req: Request, res: Response): Promise<void> {
    try {
      const policy = await policyService.createPolicy(req.body, req.user!.userId);
      successResponse(res, policy, 'Policy created successfully', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const policy = policyService.getPolicy(req.params.id);
      if (!policy) {
        errorResponse(res, 'Policy not found', 404);
        return;
      }
      successResponse(res, policy, 'Policy retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as any,
        policyType: req.query.policyType as any,
        customerId: req.query.customerId as string,
        riskCategory: req.query.riskCategory as string,
      };

      const result = policyService.listPolicies(filters, page, limit);
      paginatedResponse(res, result.data, result.total, page, limit, 'Policies retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const policy = await policyService.updatePolicy(req.params.id, req.body, req.user!.userId);
      successResponse(res, policy, 'Policy updated successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!status) {
        errorResponse(res, 'Status is required', 400);
        return;
      }
      const policy = await policyService.changeStatus(req.params.id, status, req.user!.userId);
      successResponse(res, policy, 'Policy status updated');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async getVersions(req: Request, res: Response): Promise<void> {
    try {
      const policy = policyService.getPolicy(req.params.id);
      if (!policy) {
        errorResponse(res, 'Policy not found', 404);
        return;
      }
      successResponse(res, policy.versionHistory, 'Version history retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getAudit(req: Request, res: Response): Promise<void> {
    try {
      const audit = policyService.getPolicyAudit(req.params.id);
      successResponse(res, audit, 'Policy audit trail retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ─── Quote / Bind / Issue ──────────────────────────────────────

  async createQuote(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, policyType, coverageAmount, startDate, endDate } = req.body;
      const missing: string[] = [];
      if (!customerId) missing.push('customerId');
      if (!policyType) missing.push('policyType');
      if (!coverageAmount) missing.push('coverageAmount');
      if (!startDate) missing.push('startDate');
      if (!endDate) missing.push('endDate');
      if (missing.length) {
        errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
        return;
      }
      if (typeof coverageAmount !== 'number' || coverageAmount <= 0) {
        errorResponse(res, 'coverageAmount must be a positive number', 400);
        return;
      }
      const result = await policyService.createQuote(req.body, req.user!.userId);
      successResponse(res, result, 'Quote created successfully', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async calculatePremium(req: Request, res: Response): Promise<void> {
    try {
      const premium = policyService.calculateQuotePremium(req.body);
      successResponse(res, premium, 'Premium calculated');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async bindPolicy(req: Request, res: Response): Promise<void> {
    try {
      const policy = await policyService.bindPolicy(req.params.id, req.user!.userId);
      successResponse(res, policy, 'Policy bound successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async issuePolicy(req: Request, res: Response): Promise<void> {
    try {
      const policy = await policyService.issuePolicy(req.params.id, req.user!.userId);
      successResponse(res, policy, 'Policy issued successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  // ─── Endorsements ──────────────────────────────────────────────

  async createEndorsement(req: Request, res: Response): Promise<void> {
    try {
      const endorsement = await policyService.createEndorsement(req.params.id, req.body, req.user!.userId);
      successResponse(res, endorsement, 'Endorsement created successfully', 201);
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async approveEndorsement(req: Request, res: Response): Promise<void> {
    try {
      const endorsement = await policyService.approveEndorsement(req.params.endorsementId, req.user!.userId);
      successResponse(res, endorsement, 'Endorsement approved');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async applyEndorsement(req: Request, res: Response): Promise<void> {
    try {
      const result = await policyService.applyEndorsement(req.params.endorsementId, req.user!.userId);
      successResponse(res, result, 'Endorsement applied to policy');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async getEndorsements(req: Request, res: Response): Promise<void> {
    try {
      const endorsements = policyService.getEndorsements(req.params.id);
      successResponse(res, endorsements, 'Endorsements retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ─── Renewals ──────────────────────────────────────────────────

  async initiateRenewal(req: Request, res: Response): Promise<void> {
    try {
      const renewal = await policyService.initiateRenewal(req.params.id, req.user!.userId);
      successResponse(res, renewal, 'Renewal initiated', 201);
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async acceptRenewal(req: Request, res: Response): Promise<void> {
    try {
      const result = await policyService.acceptRenewal(req.params.renewalId, req.user!.userId);
      successResponse(res, result, 'Renewal accepted, new policy created');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async declineRenewal(req: Request, res: Response): Promise<void> {
    try {
      const renewal = await policyService.declineRenewal(req.params.renewalId, req.user!.userId);
      successResponse(res, renewal, 'Renewal declined');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async getRenewals(req: Request, res: Response): Promise<void> {
    try {
      const renewals = policyService.getRenewals(req.params.id);
      successResponse(res, renewals, 'Renewals retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getAllPendingRenewals(req: Request, res: Response): Promise<void> {
    try {
      const renewals = policyService.getAllPendingRenewals();
      successResponse(res, renewals, 'Pending renewals retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ─── Reinstatement ─────────────────────────────────────────────

  async reinstatePolicy(req: Request, res: Response): Promise<void> {
    try {
      const policy = await policyService.reinstatePolicy(req.params.id, req.user!.userId);
      successResponse(res, policy, 'Policy reinstated successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  // ─── Status Transitions ────────────────────────────────────────

  async getStatusTransitions(req: Request, res: Response): Promise<void> {
    try {
      const policy = policyService.getPolicy(req.params.id);
      if (!policy) {
        errorResponse(res, 'Policy not found', 404);
        return;
      }
      const transitions = policyService.getStatusTransitions(policy.status);
      successResponse(res, { currentStatus: policy.status, allowedTransitions: transitions }, 'Status transitions retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}

export const policyController = new PolicyController();
