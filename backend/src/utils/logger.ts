import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]${metaStr}: ${message}`;
});

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'pas-api' },
  transports: [
    // Console transport — colorized in dev, JSON in production
    new winston.transports.Console({
      format: config.nodeEnv === 'production'
        ? combine(timestamp(), json())
        : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), consoleFormat),
    }),
    // File transport — structured JSON for all environments
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), json()),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), json()),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Request logging middleware
export function requestLogger(req: any, res: any, next: any): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || 'anonymous',
      ip: req.ip,
    };
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  next();
}
