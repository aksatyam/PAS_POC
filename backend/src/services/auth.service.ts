import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { blacklistToken } from '../middleware/auth.middleware';
import { generateLogId } from '../utils/id-generator';
import { AuthTokens, JwtPayload, User } from '../models';

export class AuthService {
  async login(email: string, password: string, ipAddress: string = 'unknown'): Promise<{ user: Omit<User, 'hashedPassword'>; tokens: AuthTokens }> {
    const user = userRepository.findByEmail(email);
    if (!user) {
      await this.logAudit('FAILED_LOGIN', 'unknown', email, ipAddress);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      await this.logAudit('FAILED_LOGIN', user.id, email, ipAddress);
      throw new Error('Account is deactivated. Contact admin.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      await this.logAudit('FAILED_LOGIN', user.id, email, ipAddress);
      throw new Error('Invalid email or password');
    }

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessSignOptions: SignOptions = {
      expiresIn: config.jwtExpiry as any,
    };

    const refreshSignOptions: SignOptions = {
      expiresIn: config.jwtRefreshExpiry as any,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, accessSignOptions);
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, refreshSignOptions);

    await this.logAudit('LOGIN', user.id, email, ipAddress);

    const { hashedPassword, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken },
    };
  }

  async logout(token: string, userId: string, ipAddress: string = 'unknown'): Promise<void> {
    blacklistToken(token);
    await this.logAudit('LOGOUT', userId, '', ipAddress);
  }

  async refreshToken(refreshTokenStr: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshTokenStr, config.jwtRefreshSecret) as JwtPayload;

      const user = userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const signOptions: SignOptions = {
        expiresIn: config.jwtExpiry as any,
      };

      const accessToken = jwt.sign(payload, config.jwtSecret, signOptions);

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  getProfile(userId: string): Omit<User, 'hashedPassword'> | undefined {
    const user = userRepository.findById(userId);
    if (!user) return undefined;
    const { hashedPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async logAudit(action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'TOKEN_REFRESH', userId: string, email: string, ipAddress: string): Promise<void> {
    try {
      await auditRepository.create({
        id: generateLogId(),
        actor: { userId, role: 'system' },
        action,
        resource: { type: 'auth', id: userId },
        ipAddress,
        timestamp: new Date().toISOString(),
        metadata: { email },
      });
    } catch {
      // Silently fail
    }
  }
}

export const authService = new AuthService();
