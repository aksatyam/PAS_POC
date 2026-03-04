import { Request, Response, NextFunction } from 'express';

const API_VERSION = '1.0.0';
const DEPRECATION_NOTICE = ''; // Set when deprecating a version

/**
 * Middleware that adds API versioning headers to all responses.
 * Headers:
 *   X-API-Version: current API version
 *   X-Request-Id: unique request identifier for tracing
 *   X-Deprecation: deprecation notice (if applicable)
 */
export function apiVersionHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-API-Version', API_VERSION);
  res.setHeader('X-Request-Id', generateRequestId());

  if (DEPRECATION_NOTICE) {
    res.setHeader('X-Deprecation', DEPRECATION_NOTICE);
  }

  next();
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
