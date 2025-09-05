import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  submitFeedback,
  getFeedbackStats,
  getRecentFeedback,
  getMessageFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

// All routes use optional auth (can work with or without authentication)
router.use(optionalAuth);

// Submit feedback for a chat response
router.post('/', submitFeedback);

// Get feedback statistics
router.get('/stats', getFeedbackStats);

// Get recent feedback
router.get('/recent', getRecentFeedback);

// Get feedback for a specific message
router.get('/message/:messageId', getMessageFeedback);

// Delete feedback (requires authentication)
router.delete('/:feedbackId', deleteFeedback);

export default router;
