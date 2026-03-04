import { Request, Response } from 'express';
import { notificationRepository } from '../repositories/notification.repository';
import { notificationEngine } from '../services/notificationEngine';

export class NotificationController {
  /** GET /notifications */
  static list(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { type, isRead, page = '1', limit = '20' } = req.query;
    let notifications = notificationRepository.findByRecipient(userId);

    if (type) notifications = notifications.filter((n) => n.type === type);
    if (isRead !== undefined) notifications = notifications.filter((n) => n.isRead === (isRead === 'true'));

    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);
    const { data, total } = notificationRepository.paginate(notifications, p, l);

    res.json({
      success: true,
      data,
      pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    });
  }

  /** GET /notifications/unread-count */
  static unreadCount(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const count = notificationRepository.countUnread(userId);
    res.json({ success: true, data: { count } });
  }

  /** PUT /notifications/:id/read */
  static markAsRead(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const notif = notificationRepository.findById(id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (notif.recipientId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    notificationRepository.markAsRead(id);
    res.json({ success: true, message: 'Marked as read' });
  }

  /** PUT /notifications/read-all */
  static markAllAsRead(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const count = notificationRepository.markAllAsRead(userId);
    res.json({ success: true, message: `${count} notifications marked as read` });
  }

  /** DELETE /notifications/:id */
  static async remove(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const notif = notificationRepository.findById(id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (notif.recipientId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    await notificationRepository.delete(id);
    res.json({ success: true, message: 'Notification deleted' });
  }
}
