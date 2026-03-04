import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Reports with date filtering
router.get('/policies', (req, res) => reportController.getPolicyReport(req, res));
router.get('/claims', (req, res) => reportController.getClaimsReport(req, res));
router.get('/underwriting', (req, res) => reportController.getUnderwritingReport(req, res));
router.get('/billing', (req, res) => reportController.getBillingReport(req, res));
router.get('/executive', (req, res) => reportController.getExecutiveReport(req, res));

// CSV Exports
router.get('/export/policies', (req, res) => reportController.exportPoliciesCSV(req, res));
router.get('/export/claims', (req, res) => reportController.exportClaimsCSV(req, res));

export default router;
