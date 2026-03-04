import { Request, Response } from 'express';
import { claimService } from '../services/claim.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class ClaimController {
  // ─── FNOL ──────────────────────────────────────────────────
  async submitFNOL(req: Request, res: Response): Promise<void> {
    try {
      const fnol = await claimService.submitFNOL(req.body, req.user!.userId);
      successResponse(res, fnol, 'FNOL submitted successfully', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async processFNOL(req: Request, res: Response): Promise<void> {
    try {
      const result = await claimService.processFNOL(req.params.fnolId, req.user!.userId);
      successResponse(res, result, 'FNOL processed — claim created');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async getFNOL(req: Request, res: Response): Promise<void> {
    try {
      const fnol = claimService.getFNOL(req.params.fnolId);
      if (!fnol) { errorResponse(res, 'FNOL not found', 404); return; }
      successResponse(res, fnol, 'FNOL retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async listFNOLs(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as any;
      const fnols = claimService.listFNOLs(status);
      successResponse(res, fnols, 'FNOLs retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ─── Claims ────────────────────────────────────────────────
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { policyId, claimType, amount, description } = req.body;
      const missing: string[] = [];
      if (!policyId) missing.push('policyId');
      if (!claimType) missing.push('claimType');
      if (amount === undefined || amount === null) missing.push('amount');
      if (!description) missing.push('description');
      if (missing.length) {
        errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
        return;
      }
      if (typeof amount !== 'number' || amount <= 0) {
        errorResponse(res, 'amount must be a positive number', 400);
        return;
      }
      const claim = await claimService.registerClaim(req.body, req.user!.userId);
      successResponse(res, claim, 'Claim registered successfully', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const claim = claimService.getClaim(req.params.id);
      if (!claim) { errorResponse(res, 'Claim not found', 404); return; }
      successResponse(res, claim, 'Claim retrieved');
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
        policyId: req.query.policyId as string,
        claimType: req.query.claimType as string,
      };
      const result = claimService.listClaims(filters, page, limit);
      paginatedResponse(res, result.data, result.total, page, limit, 'Claims retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!status) { errorResponse(res, 'Status is required', 400); return; }
      const claim = await claimService.updateStatus(req.params.id, status, req.user!.userId);
      successResponse(res, claim, 'Claim status updated');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async settle(req: Request, res: Response): Promise<void> {
    try {
      const { settlementAmount } = req.body;
      if (settlementAmount === undefined || settlementAmount === null) {
        errorResponse(res, 'Settlement amount is required', 400);
        return;
      }
      const claim = await claimService.settleClaim(req.params.id, settlementAmount, req.user!.userId);
      successResponse(res, claim, 'Claim settled successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  // ─── Adjudication ──────────────────────────────────────────
  async updateAdjudication(req: Request, res: Response): Promise<void> {
    try {
      const { adjudicationStatus } = req.body;
      if (!adjudicationStatus) { errorResponse(res, 'Adjudication status is required', 400); return; }
      const claim = await claimService.updateAdjudicationStatus(req.params.id, adjudicationStatus, req.user!.userId);
      successResponse(res, claim, 'Adjudication status updated');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async listByAdjudication(req: Request, res: Response): Promise<void> {
    try {
      const adjStatus = req.query.adjudicationStatus as any;
      if (!adjStatus) { errorResponse(res, 'adjudicationStatus query param required', 400); return; }
      const claims = claimService.getClaimsByAdjudicationStatus(adjStatus);
      successResponse(res, claims, 'Claims retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ─── Reserves ──────────────────────────────────────────────
  async setReserve(req: Request, res: Response): Promise<void> {
    try {
      const { amount, reason } = req.body;
      if (amount === undefined) { errorResponse(res, 'Amount is required', 400); return; }
      const reserve = await claimService.setReserve(req.params.id, amount, reason || '', req.user!.userId);
      successResponse(res, reserve, 'Reserve set successfully', 201);
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async getReserveHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = claimService.getReserveHistory(req.params.id);
      successResponse(res, history, 'Reserve history retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ─── Fraud ─────────────────────────────────────────────────
  async getFraudAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessment = claimService.getFraudAssessment(req.params.id);
      successResponse(res, assessment, 'Fraud assessment retrieved');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  // ─── Loss Mitigation ──────────────────────────────────────
  async addMitigation(req: Request, res: Response): Promise<void> {
    try {
      const mitigation = await claimService.addMitigation(req.params.id, req.body, req.user!.userId);
      successResponse(res, mitigation, 'Mitigation action added', 201);
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async updateMitigationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      if (!status) { errorResponse(res, 'Status is required', 400); return; }
      const mitigation = await claimService.updateMitigationStatus(req.params.mitigationId, status, req.user!.userId);
      successResponse(res, mitigation, 'Mitigation status updated');
    } catch (error: any) {
      const errStatus = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, errStatus);
    }
  }

  async getMitigations(req: Request, res: Response): Promise<void> {
    try {
      const mitigations = claimService.getMitigations(req.params.id);
      successResponse(res, mitigations, 'Mitigations retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // ─── Policy claims ────────────────────────────────────────
  async getByPolicy(req: Request, res: Response): Promise<void> {
    try {
      const claims = claimService.getClaimsByPolicy(req.params.policyId);
      successResponse(res, claims, 'Claims retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}

export const claimController = new ClaimController();
