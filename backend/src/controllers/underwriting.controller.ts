import { Request, Response } from 'express';
import { underwritingService } from '../services/underwriting.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class UnderwritingController {
  async evaluate(req: Request, res: Response): Promise<void> {
    try {
      const result = await underwritingService.evaluate(req.body, req.user!.userId);
      successResponse(res, result, 'Underwriting evaluation completed', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const record = underwritingService.getById(req.params.id);
      if (!record) {
        errorResponse(res, 'Underwriting record not found', 404);
        return;
      }
      successResponse(res, record, 'Underwriting record retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getByPolicyId(req: Request, res: Response): Promise<void> {
    try {
      const record = underwritingService.getByPolicyId(req.params.policyId);
      if (!record) {
        errorResponse(res, 'No underwriting record found for this policy', 404);
        return;
      }
      successResponse(res, record, 'Underwriting record retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = underwritingService.listAll(page, limit);
      paginatedResponse(res, result.data, result.total, page, limit, 'Underwriting records retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getRules(req: Request, res: Response): Promise<void> {
    try {
      const rules = underwritingService.getRules();
      successResponse(res, rules, 'Underwriting rules retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async override(req: Request, res: Response): Promise<void> {
    try {
      const { decision, reason } = req.body;
      if (!decision || !reason) {
        errorResponse(res, 'Decision and reason are required', 400);
        return;
      }

      const result = await underwritingService.overrideDecision(
        req.params.id,
        decision,
        reason,
        req.user!.userId
      );
      successResponse(res, result, 'Decision overridden successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }
}

export const underwritingController = new UnderwritingController();
