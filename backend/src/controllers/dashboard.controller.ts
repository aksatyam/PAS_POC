import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { kpiEngine } from '../services/kpiEngine';
import { successResponse, errorResponse } from '../utils/response';

export class DashboardController {
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = dashboardService.getSummary();
      successResponse(res, summary, 'Dashboard summary retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getClaimsAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = dashboardService.getClaimsAnalytics();
      successResponse(res, analytics, 'Claims analytics retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getUnderwritingStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = dashboardService.getUnderwritingStats();
      successResponse(res, stats, 'Underwriting stats retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getRiskBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const breakdown = dashboardService.getRiskBreakdown();
      successResponse(res, breakdown, 'Risk breakdown retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getRoleDashboard(req: Request, res: Response): Promise<void> {
    try {
      const role = req.params.role || req.user?.role || 'Viewer';
      const data = kpiEngine.getRoleDashboard(role);
      successResponse(res, data, `Dashboard for ${role} retrieved`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getKPIs(req: Request, res: Response): Promise<void> {
    try {
      const kpis = kpiEngine.getExecutiveKPIs();
      successResponse(res, kpis, 'KPIs retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}

export const dashboardController = new DashboardController();
