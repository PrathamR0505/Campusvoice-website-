import express from 'express';
import {
  analyzeDraft,
  checkDuplicateDraft,
  getSimilarIssues,
} from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/analyze-draft', analyzeDraft);
router.post('/check-duplicates', checkDuplicateDraft);
router.get('/reports/:id/similar', getSimilarIssues);

export default router;
