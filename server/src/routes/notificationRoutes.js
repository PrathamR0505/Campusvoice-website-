import express from 'express';
import { getUserNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getUserNotifications);
router.put('/:id/read', markNotificationRead);

export default router;
