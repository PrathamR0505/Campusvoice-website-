import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  getAuthorizedDomains,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/domains', getAuthorizedDomains);

// Protected routes
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

export default router;
