import { BaseRepository } from './base.repository';
import { AuditLog, AuditAction } from '../models';

class AuditRepository extends BaseRepository<AuditLog> {
  constructor() {
    super('audit-logs.json');
  }

  findByActor(userId: string): AuditLog[] {
    return this.loadData().filter((log) => log.actor.userId === userId);
  }

  findByAction(action: AuditAction): AuditLog[] {
    return this.loadData().filter((log) => log.action === action);
  }

  findByResource(resourceType: string, resourceId?: string): AuditLog[] {
    return this.loadData().filter((log) => {
      if (log.resource.type !== resourceType) return false;
      if (resourceId && log.resource.id !== resourceId) return false;
      return true;
    });
  }

  findFiltered(filters: {
    action?: AuditAction;
    userId?: string;
    resourceType?: string;
    from?: string;
    to?: string;
  }): AuditLog[] {
    return this.loadData().filter((log) => {
      if (filters.action && log.action !== filters.action) return false;
      if (filters.userId && log.actor.userId !== filters.userId) return false;
      if (filters.resourceType && log.resource.type !== filters.resourceType) return false;
      if (filters.from && log.timestamp < filters.from) return false;
      if (filters.to && log.timestamp > filters.to) return false;
      return true;
    });
  }
}

export const auditRepository = new AuditRepository();
