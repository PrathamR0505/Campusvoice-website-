import express from 'express';
import {
  getFormOptions,
  createReport,
  getReports,
  getReportById,
  toggleSupport,
  addComment,
  deleteComment,
} from '../controllers/reportController.js';
import { submitResolutionFeedback } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadMediaMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public / Authenticated discovery
router.get('/options', getFormOptions);
router.get('/', getReports);
router.get('/:id', getReportById);

// Protected report submissions & interactions
router.post('/', requireAuth, uploadMediaMiddleware.array('media', 6), createReport);
router.post('/:id/support', requireAuth, toggleSupport);
router.post('/:id/comments', requireAuth, addComment);
router.delete('/comments/:commentId', requireAuth, deleteComment);

// Resolution Verification by students
router.post('/:id/resolution-feedback', requireAuth, submitResolutionFeedback);

export default router;
