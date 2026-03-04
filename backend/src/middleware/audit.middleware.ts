import { Request, Response, NextFunction } from 'express';
import { AuditAction } from '../models';
import { auditRepository } from '../repositories/audit.repository';
import { generateLogId } from '../utils/id-generator';
import { maskObject } from '../utils/pii-masker';

export function auditLog(action: AuditAction, resourceType: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Capture the original json method to intercept the response
    const originalJson = res.json.bind(res);
    const beforeState = req.body ? { ...req.body } : undefined;

    res.json = function (body: any) {
      // Log after the response is sent
      try {
        const logEntry = {
          id: generateLogId(),
          actor: {
            userId: req.user?.userId || 'anonymous',
            role: req.user?.role || 'unknown',
          },
          action,
          resource: {
            type: resourceType,
            id: req.params.id || body?.data?.id || 'unknown',
          },
          before: beforeState ? maskObject(beforeState) : undefined,
          after: body?.data ? maskObject(typeof body.data === 'object' ? { ...body.data } : body.data) : undefined,
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
          timestamp: new Date().toISOString(),
          metadata: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
          },
        };

        auditRepository.create(logEntry).catch(() => {
          // Silently fail audit logging - don't break the request
        });
      } catch {
        // Silently fail
      }

      return originalJson(body);
    };

    next();
  };
}
