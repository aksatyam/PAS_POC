import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { successResponse, errorResponse } from '../utils/response';

export class ReportController {
  getPolicyReport(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const data = reportService.getPolicyReport(from as string, to as string);
      successResponse(res, data, 'Policy report generated');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  getClaimsReport(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const data = reportService.getClaimsReport(from as string, to as string);
      successResponse(res, data, 'Claims report generated');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  getUnderwritingReport(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const data = reportService.getUnderwritingReport(from as string, to as string);
      successResponse(res, data, 'Underwriting report generated');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  getBillingReport(req: Request, res: Response) {
    try {
      const data = reportService.getBillingReport();
      successResponse(res, data, 'Billing report generated');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  getExecutiveReport(req: Request, res: Response) {
    try {
      const data = reportService.getExecutiveReport();
      successResponse(res, data, 'Executive KPI report generated');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  exportPoliciesCSV(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const csv = reportService.getPoliciesCSV(from as string, to as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=policies-report.csv');
      res.send(csv);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  exportClaimsCSV(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const csv = reportService.getClaimsCSV(from as string, to as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=claims-report.csv');
      res.send(csv);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}

export const reportController = new ReportController();
