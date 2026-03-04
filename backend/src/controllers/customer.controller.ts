import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export class CustomerController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone } = req.body;
      const missing: string[] = [];
      if (!name || !name.trim()) missing.push('name');
      if (!email || !email.trim()) missing.push('email');
      if (!phone || !phone.trim()) missing.push('phone');
      if (missing.length) {
        errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errorResponse(res, 'Invalid email format', 400);
        return;
      }
      const customer = await customerService.create(req.body);
      successResponse(res, customer, 'Customer created successfully', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const customer = customerService.getById(req.params.id);
      if (!customer) {
        errorResponse(res, 'Customer not found', 404);
        return;
      }
      successResponse(res, customer, 'Customer retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = customerService.getAll(page, limit);
      paginatedResponse(res, result.data, result.total, page, limit, 'Customers retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      successResponse(res, customer, 'Customer updated successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await customerService.delete(req.params.id);
      successResponse(res, null, 'Customer deleted successfully');
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      errorResponse(res, error.message, status);
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      if (!query) {
        errorResponse(res, 'Search query (q) is required', 400);
        return;
      }
      const results = customerService.searchCustomers(query);
      successResponse(res, results, `Found ${results.length} customer(s)`);
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getWithPolicies(req: Request, res: Response): Promise<void> {
    try {
      const result = customerService.getCustomerWithPolicies(req.params.id);
      if (!result) {
        errorResponse(res, 'Customer not found', 404);
        return;
      }
      successResponse(res, result, 'Customer with policies retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}

export const customerController = new CustomerController();
