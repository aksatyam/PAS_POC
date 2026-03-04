import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Parse CORS origins — supports comma-separated list for multiple domains
const parseCorsOrigins = (origins: string): string | string[] => {
  const list = origins.split(',').map((o) => o.trim()).filter(Boolean);
  return list.length === 1 ? list[0] : list;
};

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtExpiry: process.env.JWT_EXPIRY || '1h',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
};
