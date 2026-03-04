import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class AdminController {
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = adminService.listUsers();
      successResponse(res, users, 'Users retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, role, password } = req.body;
      if (!email || !name || !role || !password) {
        errorResponse(res, 'Email, name, role, and password are required', 400);
        return;
      }

      const user = await adminService.createUser({ email, name, role, password });
      successResponse(res, user, 'User created successfully', 201);
    } catch (error: any) {
      const status = error.message.includes('already exists') ? 409 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await adminService.updateUser(req.params.id, req.body);
      successResponse(res, user, 'User updated successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await adminService.deactivateUser(req.params.id);
      successResponse(res, user, 'User deactivated successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async getSystemLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        action: req.query.action as any,
        userId: req.query.userId as string,
        resourceType: req.query.resourceType as string,
        from: req.query.from as string,
        to: req.query.to as string,
      };

      const result = adminService.getSystemLogs(filters, page, limit);
      paginatedResponse(res, result.data, result.total, page, limit, 'System logs retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}

export const adminController = new AdminController();
