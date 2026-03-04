import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { createApiKeySchema, createWebhookSchema } from '../schemas';
import { ApiKey, Webhook, WebhookEvent } from '../models/integration.model';
import { generateId } from '../utils/id-generator';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = Router();
router.use(authenticate);

function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}
router.use(adminOnly);

const KEYS_PATH = path.resolve(__dirname, '../../mock-data/apiKeys.json');
const HOOKS_PATH = path.resolve(__dirname, '../../mock-data/webhooks.json');

function loadKeys(): ApiKey[] {
  try { return JSON.parse(fs.readFileSync(KEYS_PATH, 'utf-8')); } catch { return []; }
}
function saveKeys(keys: ApiKey[]) { fs.writeFileSync(KEYS_PATH, JSON.stringify(keys, null, 2)); }
function loadWebhooks(): Webhook[] {
  try { return JSON.parse(fs.readFileSync(HOOKS_PATH, 'utf-8')); } catch { return []; }
}
function saveWebhooks(hooks: Webhook[]) { fs.writeFileSync(HOOKS_PATH, JSON.stringify(hooks, null, 2)); }

// ─── API Keys ────────────────────────────────────────────────
/** GET /integrations/keys — List API keys (Admin only) */
router.get('/keys', (_req: Request, res: Response) => {
  const keys = loadKeys().map((k) => ({ ...k, key: k.key.slice(0, 12) + '...' }));
  res.json({ success: true, data: keys });
});

/** POST /integrations/keys — Generate new API key */
router.post('/keys', validate(createApiKeySchema), auditLog('CREATE', 'ApiKey'), (req: Request, res: Response) => {
  const { name, rateLimit = 100, permissions = [] } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  const keys = loadKeys();
  const newKey: ApiKey = {
    id: generateId('KEY'),
    name,
    key: `pk_live_${crypto.randomBytes(24).toString('hex')}`,
    createdBy: (req as any).user.userId,
    isActive: true,
    rateLimit,
    usageCount: 0,
    permissions,
    createdAt: new Date().toISOString(),
  };
  keys.push(newKey);
  saveKeys(keys);
  res.status(201).json({ success: true, data: newKey, message: 'API key created. Store the key securely — it will not be shown again in full.' });
});

/** PUT /integrations/keys/:id — Update API key */
router.put('/keys/:id', auditLog('UPDATE', 'ApiKey'), (req: Request, res: Response) => {
  const keys = loadKeys();
  const idx = keys.findIndex((k) => k.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'API key not found' });

  const { name, rateLimit, permissions, isActive } = req.body;
  if (name !== undefined) keys[idx].name = name;
  if (rateLimit !== undefined) keys[idx].rateLimit = rateLimit;
  if (permissions !== undefined) keys[idx].permissions = permissions;
  if (isActive !== undefined) keys[idx].isActive = isActive;
  saveKeys(keys);
  res.json({ success: true, data: { ...keys[idx], key: keys[idx].key.slice(0, 12) + '...' } });
});

/** DELETE /integrations/keys/:id — Revoke API key */
router.delete('/keys/:id', auditLog('DELETE', 'ApiKey'), (req: Request, res: Response) => {
  let keys = loadKeys();
  keys = keys.filter((k) => k.id !== req.params.id);
  saveKeys(keys);
  res.json({ success: true, message: 'API key revoked' });
});

// ─── Webhooks ────────────────────────────────────────────────
/** GET /integrations/webhooks — List webhooks */
router.get('/webhooks', (_req: Request, res: Response) => {
  const hooks = loadWebhooks().map((h) => ({ ...h, secret: h.secret.slice(0, 8) + '...' }));
  res.json({ success: true, data: hooks });
});

/** POST /integrations/webhooks — Register webhook */
router.post('/webhooks', validate(createWebhookSchema), auditLog('CREATE', 'Webhook'), (req: Request, res: Response) => {
  const { name, url, events, maxRetries = 3 } = req.body;
  if (!name || !url || !events?.length) return res.status(400).json({ success: false, message: 'name, url, and events are required' });

  const hooks = loadWebhooks();
  const newHook: Webhook = {
    id: generateId('WH'),
    name,
    url,
    events: events as WebhookEvent[],
    status: 'Active',
    secret: `whsec_${crypto.randomBytes(16).toString('hex')}`,
    retryCount: 0,
    maxRetries,
    failureCount: 0,
    createdBy: (req as any).user.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  hooks.push(newHook);
  saveWebhooks(hooks);
  res.status(201).json({ success: true, data: newHook });
});

/** PUT /integrations/webhooks/:id — Update webhook */
router.put('/webhooks/:id', auditLog('UPDATE', 'Webhook'), (req: Request, res: Response) => {
  const hooks = loadWebhooks();
  const idx = hooks.findIndex((h) => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Webhook not found' });

  const { name, url, events, status, maxRetries } = req.body;
  if (name !== undefined) hooks[idx].name = name;
  if (url !== undefined) hooks[idx].url = url;
  if (events !== undefined) hooks[idx].events = events;
  if (status !== undefined) hooks[idx].status = status;
  if (maxRetries !== undefined) hooks[idx].maxRetries = maxRetries;
  hooks[idx].updatedAt = new Date().toISOString();
  saveWebhooks(hooks);
  res.json({ success: true, data: { ...hooks[idx], secret: hooks[idx].secret.slice(0, 8) + '...' } });
});

/** DELETE /integrations/webhooks/:id — Remove webhook */
router.delete('/webhooks/:id', auditLog('DELETE', 'Webhook'), (req: Request, res: Response) => {
  let hooks = loadWebhooks();
  hooks = hooks.filter((h) => h.id !== req.params.id);
  saveWebhooks(hooks);
  res.json({ success: true, message: 'Webhook removed' });
});

/** POST /integrations/webhooks/:id/test — Test webhook delivery */
router.post('/webhooks/:id/test', (req: Request, res: Response) => {
  const hooks = loadWebhooks();
  const hook = hooks.find((h) => h.id === req.params.id);
  if (!hook) return res.status(404).json({ success: false, message: 'Webhook not found' });

  // Mock test delivery
  res.json({
    success: true,
    data: {
      webhookId: hook.id,
      event: 'test',
      url: hook.url,
      responseStatus: 200,
      responseTime: '120ms',
      message: 'Test delivery successful (simulated)',
    },
  });
});

/** GET /integrations/summary — Integration overview */
router.get('/summary', (_req: Request, res: Response) => {
  const keys = loadKeys();
  const hooks = loadWebhooks();
  res.json({
    success: true,
    data: {
      apiKeys: { total: keys.length, active: keys.filter((k) => k.isActive).length },
      webhooks: {
        total: hooks.length,
        active: hooks.filter((h) => h.status === 'Active').length,
        failed: hooks.filter((h) => h.status === 'Failed').length,
      },
    },
  });
});

export default router;
