import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import routes from './routes';
import { swaggerSpec } from './swagger';
import { logger, requestLogger } from './utils/logger';
import { userRateLimit, authRateLimit } from './middleware/userRateLimit.middleware';
import { apiVersionHeaders } from './middleware/apiVersion.middleware';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-API-Version', 'X-Request-Id', 'X-Deprecation', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API versioning headers
app.use(apiVersionHeaders);

// Structured request logging
app.use(requestLogger);

// Global rate limiting (per IP — broad protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Auth-specific rate limit (brute-force protection)
app.use('/api/v1/auth/login', authRateLimit);
app.use('/api/v1/auth/refresh', authRateLimit);

// Per-user rate limiting (applied after auth resolves the user)
app.use('/api/v1', userRateLimit);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PAS Prototype API Docs',
}));

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PAS Prototype API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0',
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.nodeEnv === 'development' && { error: err.message }),
  });
});

// Start server
app.listen(config.port, () => {
  logger.info('PAS Prototype API Server started', {
    environment: config.nodeEnv,
    port: config.port,
    apiBase: `http://localhost:${config.port}/api/v1`,
    swagger: `http://localhost:${config.port}/api-docs`,
  });
});

export default app;
