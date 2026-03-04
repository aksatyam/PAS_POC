import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { auditLog } from '../middleware/audit.middleware';
import { validate } from '../middleware/validate.middleware';
import { generateDocumentSchema, uploadDocumentSchema } from '../schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Templates
router.get('/templates', (req, res) => documentController.getTemplates(req, res));

// Document generation
router.post('/generate', authorize('Admin', 'Operations', 'Underwriter', 'Claims'), validate(generateDocumentSchema), auditLog('CREATE', 'Document'), (req, res) => documentController.generate(req, res));

// CRUD
router.get('/', (req, res) => documentController.list(req, res));
router.get('/policy/:policyId', (req, res) => documentController.listByPolicy(req, res));
router.get('/claim/:claimId', (req, res) => documentController.listByClaim(req, res));
router.get('/:id', (req, res) => documentController.getById(req, res));
router.get('/:id/versions', (req, res) => documentController.getVersions(req, res));
router.post('/', authorize('Admin', 'Operations', 'Underwriter', 'Claims'), validate(uploadDocumentSchema), auditLog('CREATE', 'Document'), (req, res) => documentController.upload(req, res));
router.put('/:id/verify', authorize('Admin', 'Operations'), auditLog('UPDATE', 'Document'), (req, res) => documentController.verify(req, res));
router.delete('/:id', authorize('Admin'), auditLog('DELETE', 'Document'), (req, res) => documentController.remove(req, res));

export default router;
