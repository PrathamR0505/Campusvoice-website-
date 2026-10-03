import express from 'express';
import {
  getAdminOverview,
  updateReportStatus,
  uploadResolutionEvidence,
  submitResolutionFeedback,
  deleteReport,
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { uploadMediaMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All admin routes require authentication and Admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get('/overview', getAdminOverview);
router.put('/reports/:id/status', uploadMediaMiddleware.array('evidence', 4), updateReportStatus);
router.post('/reports/:id/evidence', uploadMediaMiddleware.array('evidence', 4), uploadResolutionEvidence);
router.delete('/reports/:id', deleteReport);

export default router;
