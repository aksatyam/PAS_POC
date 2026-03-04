import bcrypt from 'bcryptjs';
import { User } from '../models';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { generateId } from '../utils/id-generator';

export class AdminService {
  listUsers(): Omit<User, 'hashedPassword'>[] {
    return userRepository.findAll().map(({ hashedPassword, ...user }) => user);
  }

  async createUser(data: {
    email: string;
    name: string;
    role: User['role'];
    password: string;
  }): Promise<Omit<User, 'hashedPassword'>> {
    const existing = userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const now = new Date().toISOString();

    const user: User = {
      id: generateId('USR'),
      email: data.email,
      name: data.name,
      role: data.role,
      hashedPassword,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await userRepository.create(user);

    const { hashedPassword: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, data: Partial<Pick<User, 'name' | 'role' | 'email'>>): Promise<Omit<User, 'hashedPassword'>> {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = userRepository.findByEmail(data.email);
      if (emailTaken) {
        throw new Error('Email already in use');
      }
    }

    const updated = await userRepository.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new Error('Failed to update user');
    }

    const { hashedPassword, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async deactivateUser(id: string): Promise<Omit<User, 'hashedPassword'>> {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    const updated = await userRepository.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new Error('Failed to deactivate user');
    }

    const { hashedPassword, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  getSystemLogs(
    filters: { action?: any; userId?: string; resourceType?: string; from?: string; to?: string },
    page: number = 1,
    limit: number = 20
  ) {
    const filtered = auditRepository.findFiltered(filters);
    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    return { data, total };
  }
}

export const adminService = new AdminService();
