import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  searchUsers,
  getUserById,
  getOnlineUsers,
  getRecentUsers,
  getAllUsers,
  getUserStats,
  deleteUser,
  updateUser
} from '../controllers/userController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Public user routes (for authenticated users)
router.get('/search', searchUsers);
router.get('/online', getOnlineUsers);
router.get('/recent', getRecentUsers);
router.get('/:userId', getUserById);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllUsers);
router.get('/admin/stats', authorize('admin'), getUserStats);
router.delete('/admin/:userId', authorize('admin'), deleteUser);
router.put('/admin/:userId', authorize('admin'), updateUser);

export default router;
