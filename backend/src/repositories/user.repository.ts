import { BaseRepository } from './base.repository';
import { User } from '../models';

class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users.json');
  }

  findByEmail(email: string): User | undefined {
    return this.loadData().find((u) => u.email === email);
  }

  findActiveUsers(): User[] {
    return this.loadData().filter((u) => u.isActive);
  }

  findByRole(role: string): User[] {
    return this.loadData().filter((u) => u.role === role);
  }
}

export const userRepository = new UserRepository();
