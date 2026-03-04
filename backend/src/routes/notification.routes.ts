import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.unreadCount);
router.put('/read-all', auditLog('UPDATE', 'Notification'), NotificationController.markAllAsRead);
router.put('/:id/read', auditLog('UPDATE', 'Notification'), NotificationController.markAsRead);
router.delete('/:id', auditLog('DELETE', 'Notification'), NotificationController.remove);

export default router;
