import { BaseRepository } from './base.repository';
import { Notification } from '../models/notification.model';

class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications.json');
  }

  findByRecipient(recipientId: string): Notification[] {
    return this.findByFilter((n) => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findUnreadByRecipient(recipientId: string): Notification[] {
    return this.findByFilter((n) => n.recipientId === recipientId && !n.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  countUnread(recipientId: string): number {
    return this.findByFilter((n) => n.recipientId === recipientId && !n.isRead).length;
  }

  markAsRead(id: string): Notification | undefined {
    const notif = this.findById(id);
    if (!notif) return undefined;
    return this.loadData().find((n) => n.id === id)
      ? (() => { const idx = this.loadData().findIndex((n) => n.id === id); this.loadData()[idx].isRead = true; this.saveData(); return this.loadData()[idx]; })()
      : undefined;
  }

  markAllAsRead(recipientId: string): number {
    const data = this.loadData();
    let count = 0;
    data.forEach((n) => {
      if (n.recipientId === recipientId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    if (count > 0) this.saveData();
    return count;
  }
}

export const notificationRepository = new NotificationRepository();
