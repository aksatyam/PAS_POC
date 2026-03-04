import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { activityFeed } from '../services/activityFeed';
import { eventBus } from '../services/eventBus';
import { EntityType } from '../models/activity.model';
import { generateId } from '../utils/id-generator';

const router = Router();
router.use(authenticate);

/** GET /activity — List recent activity entries */
router.get('/', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const entityType = req.query.entityType as EntityType | undefined;
  const entries = activityFeed.getRecent(limit, entityType);
  res.json({ success: true, data: entries });
});

/** GET /activity/entity/:type/:id — Activity for specific entity */
router.get('/entity/:type/:id', (req: Request, res: Response) => {
  const entries = activityFeed.getByEntity(req.params.type as EntityType, req.params.id);
  res.json({ success: true, data: entries });
});

/** GET /activity/user/:userId — Activity by user */
router.get('/user/:userId', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const entries = activityFeed.getByUser(req.params.userId, limit);
  res.json({ success: true, data: entries });
});

/** GET /activity/stream — SSE stream for real-time updates */
router.get('/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to activity stream' })}\n\n`);

  const clientId = generateId('SSE');
  eventBus.addSSEClient(clientId, res);

  // Send heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(`:heartbeat\n\n`); } catch { clearInterval(heartbeat); }
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    eventBus.removeSSEClient(clientId);
  });
});

/** GET /activity/status — Connection status */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      connectedClients: eventBus.getConnectedCount(),
      totalActivities: activityFeed.count(),
    },
  });
});

export default router;
