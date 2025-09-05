import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { validateMessage } from '../middleware/validate.js';
import {
  getUserChats,
  getChatMessages,
  sendMessage,
  aiChatQuery,
  getAIWebSources,
  getAIRelatedPrompts,
  createAIChat,
  getChatHistory
} from '../controllers/chatController.js';

const router = express.Router();

// All routes are optional auth (can work with or without authentication)
router.use(optionalAuth);

// Chat routes
router.get('/', getUserChats);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', validateMessage, sendMessage);

// AI routes
router.post('/ai/query', aiChatQuery);
router.get('/ai/sources', getAIWebSources);
router.get('/ai/related', getAIRelatedPrompts);
router.post('/ai/create', createAIChat);

// Chat history
router.get('/history', getChatHistory);

export default router;
