import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        errorResponse(res, 'Email and password are required', 400);
        return;
      }

      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const result = await authService.login(email, password, ipAddress);
      successResponse(res, result, 'Login successful');
    } catch (error: any) {
      errorResponse(res, error.message, 401);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        errorResponse(res, 'No token provided', 400);
        return;
      }

      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      await authService.logout(token, req.user!.userId, ipAddress);
      successResponse(res, null, 'Logged out successfully');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async profile(req: Request, res: Response): Promise<void> {
    try {
      const user = authService.getProfile(req.user!.userId);
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }
      successResponse(res, user, 'Profile retrieved');
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        errorResponse(res, 'Refresh token is required', 400);
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      successResponse(res, result, 'Token refreshed');
    } catch (error: any) {
      errorResponse(res, error.message, 401);
    }
  }
}

export const authController = new AuthController();
