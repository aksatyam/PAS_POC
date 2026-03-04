import { ActivityEntry, ActivityAction, EntityType } from '../models/activity.model';
import { generateId } from '../utils/id-generator';
import { eventBus } from './eventBus';

const MAX_ENTRIES = 500;
const activityLog: ActivityEntry[] = [];

export class ActivityFeedService {
  record(
    action: ActivityAction,
    entityType: EntityType,
    entityId: string,
    actor: { userId: string; userName: string },
    summary: string,
    details?: Record<string, any>,
  ): ActivityEntry {
    const entry: ActivityEntry = {
      id: generateId('ACT'),
      action,
      entityType,
      entityId,
      actor,
      summary,
      details,
      timestamp: new Date().toISOString(),
    };

    activityLog.unshift(entry);
    if (activityLog.length > MAX_ENTRIES) activityLog.length = MAX_ENTRIES;

    // Broadcast to SSE clients
    eventBus.emit('activity', entry);

    return entry;
  }

  getRecent(limit: number = 50, entityType?: EntityType): ActivityEntry[] {
    let entries = activityLog;
    if (entityType) entries = entries.filter((e) => e.entityType === entityType);
    return entries.slice(0, limit);
  }

  getByEntity(entityType: EntityType, entityId: string): ActivityEntry[] {
    return activityLog.filter((e) => e.entityType === entityType && e.entityId === entityId);
  }

  getByUser(userId: string, limit: number = 50): ActivityEntry[] {
    return activityLog.filter((e) => e.actor.userId === userId).slice(0, limit);
  }

  count(): number {
    return activityLog.length;
  }
}

export const activityFeed = new ActivityFeedService();
