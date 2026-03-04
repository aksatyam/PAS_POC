import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/summary', (req, res) => dashboardController.getSummary(req, res));
router.get('/claims', (req, res) => dashboardController.getClaimsAnalytics(req, res));
router.get('/underwriting', (req, res) => dashboardController.getUnderwritingStats(req, res));
router.get('/risk', (req, res) => dashboardController.getRiskBreakdown(req, res));
router.get('/kpis', (req, res) => dashboardController.getKPIs(req, res));
router.get('/role/:role', (req, res) => dashboardController.getRoleDashboard(req, res));

export default router;
