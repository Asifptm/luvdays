import express from 'express';
import {
  checkUserExists,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getUserSessions,
  revokeSession,
  generateNewToken,
  refreshSession,
  testTokenGeneration
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateCheckExists,
  validateRegistration,
  validateLogin,
  validateProfileUpdate
} from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.post('/check-exists', validateCheckExists, checkUserExists);
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/test-tokens', testTokenGeneration); // Public route for testing token generation

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validateProfileUpdate, updateUserProfile);
router.post('/logout', protect, logoutUser);
router.get('/sessions', protect, getUserSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);
router.post('/generate-token', protect, generateNewToken);
router.post('/refresh-session', protect, refreshSession);

export default router;
