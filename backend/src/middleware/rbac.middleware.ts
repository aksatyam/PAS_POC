import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';
import { errorResponse } from '../utils/response';

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        403
      );
      return;
    }

    next();
  };
}
