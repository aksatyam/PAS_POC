import { Request, Response } from 'express';
import { documentService } from '../services/document.service';
import { documentGenerator } from '../services/documentGenerator';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class DocumentController {
  async upload(req: Request, res: Response): Promise<void> {
    try {
      const doc = await documentService.uploadDocument(req.body, req.user!.userId);
      successResponse(res, doc, 'Document uploaded successfully', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async listByPolicy(req: Request, res: Response): Promise<void> {
    try {
      const docs = documentService.listByPolicy(req.params.policyId);
      successResponse(res, docs, `Found ${docs.length} document(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async listByClaim(req: Request, res: Response): Promise<void> {
    try {
      const docs = documentService.listByClaim(req.params.claimId);
      successResponse(res, docs, `Found ${docs.length} document(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const doc = documentService.getDocument(req.params.id);
      if (!doc) {
        errorResponse(res, 'Document not found', 404);
        return;
      }
      successResponse(res, doc, 'Document retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getVersions(req: Request, res: Response): Promise<void> {
    try {
      const versions = documentService.getVersions(req.params.id);
      successResponse(res, versions, `Found ${versions.length} version(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const doc = await documentService.verifyDocument(req.params.id, req.user!.userId);
      if (!doc) {
        errorResponse(res, 'Document not found', 404);
        return;
      }
      successResponse(res, doc, 'Document verified');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await documentService.deleteDocument(req.params.id);
      if (!deleted) {
        errorResponse(res, 'Document not found', 404);
        return;
      }
      successResponse(res, null, 'Document deleted');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        category: req.query.category as string | undefined,
        type: req.query.type as string | undefined,
        policyId: req.query.policyId as string | undefined,
      };
      const result = documentService.listAll(page, limit, filters);
      paginatedResponse(res, result.data, result.total, page, limit, 'Documents retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // Document Generation
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const templates = category
        ? documentGenerator.getTemplatesByCategory(category)
        : documentGenerator.getTemplates();
      successResponse(res, templates, `Found ${templates.length} template(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, mergeData, policyId, claimId } = req.body;
      if (!templateId || !mergeData) {
        errorResponse(res, 'templateId and mergeData are required', 400);
        return;
      }

      const result = documentGenerator.generateDocument({
        templateId,
        mergeData,
        policyId,
        claimId,
        userId: req.user!.userId,
      });

      successResponse(res, {
        document: result.document,
        htmlContent: result.content,
      }, 'Document generated successfully', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}

export const documentController = new DocumentController();
