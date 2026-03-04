import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../schemas';

const router = Router();

// Public
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));

// Protected
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));
router.get('/profile', authenticate, (req, res) => authController.profile(req, res));

export default router;
