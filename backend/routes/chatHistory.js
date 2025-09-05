import express from 'express';
import ChatHistory from '../models/ChatHistory.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation for ChatHistory
const validateChatHistory = [
  body('query').notEmpty().withMessage('Query is required'),
  body('response').notEmpty().withMessage('Response is required'),
  body('text').notEmpty().withMessage('Text is required'),
  body('role').isIn(['user', 'assistant', 'system']).withMessage('Invalid role'),
  body('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status')
];

// @route   GET /api/chat-history
// @desc    Get all chat history for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = 'created_at', order = 'desc', status, role } = req.query;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const filter = { user_id: req.user._id };
    if (status) filter.status = status;
    if (role) filter.role = role;

    const chatHistory = await ChatHistory.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('session_id', 'platform device_info created_at');

    const totalCount = await ChatHistory.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        chatHistory: chatHistory.map(history => ({
          id: history._id,
          query: history.query,
          response: history.response,
          text: history.text,
          role: history.role,
          status: history.status,
          attachments: history.attachments,
          metadata: history.metadata,
          ai_model: history.ai_model,
          tokens_used: history.tokens_used,
          processing_time: history.processing_time,
          error_message: history.error_message,
          session: history.session_id,
          created_at: history.created_at,
          updated_at: history.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching chat history'
    });
  }
});

// @route   GET /api/chat-history/search
// @desc    Search chat history
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchResults = await ChatHistory.searchHistory(req.user._id, q, { page, limit });

    res.json({
      status: 'success',
      data: {
        chatHistory: searchResults.map(history => ({
          id: history._id,
          query: history.query,
          response: history.response,
          text: history.text,
          role: history.role,
          status: history.status,
          attachments: history.attachments,
          metadata: history.metadata,
          ai_model: history.ai_model,
          tokens_used: history.tokens_used,
          processing_time: history.processing_time,
          error_message: history.error_message,
          session: history.session_id,
          created_at: history.created_at,
          updated_at: history.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: searchResults.length,
          pages: Math.ceil(searchResults.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching chat history'
    });
  }
});

// @route   GET /api/chat-history/stats
// @desc    Get chat history statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await ChatHistory.getUserStats(req.user._id);

    res.json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get chat history stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching chat history statistics'
    });
  }
});

// @route   GET /api/chat-history/session/:sessionId
// @desc    Get chat history by session
// @access  Private
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chatHistory = await ChatHistory.findBySessionId(sessionId, { page, limit });

    res.json({
      status: 'success',
      data: {
        chatHistory: chatHistory.map(history => ({
          id: history._id,
          query: history.query,
          response: history.response,
          text: history.text,
          role: history.role,
          status: history.status,
          attachments: history.attachments,
          metadata: history.metadata,
          ai_model: history.ai_model,
          tokens_used: history.tokens_used,
          processing_time: history.processing_time,
          error_message: history.error_message,
          created_at: history.created_at,
          updated_at: history.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: chatHistory.length,
          pages: Math.ceil(chatHistory.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chat history by session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching chat history by session'
    });
  }
});

// @route   GET /api/chat-history/:id
// @desc    Get specific chat history entry
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const chatHistory = await ChatHistory.findOne({
      _id: id,
      user_id: req.user._id
    }).populate('session_id', 'platform device_info created_at');

    if (!chatHistory) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat history entry not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        chatHistory: {
          id: chatHistory._id,
          query: chatHistory.query,
          response: chatHistory.response,
          text: chatHistory.text,
          role: chatHistory.role,
          status: chatHistory.status,
          attachments: chatHistory.attachments,
          metadata: chatHistory.metadata,
          ai_model: chatHistory.ai_model,
          tokens_used: chatHistory.tokens_used,
          processing_time: chatHistory.processing_time,
          error_message: chatHistory.error_message,
          session: chatHistory.session_id,
          created_at: chatHistory.created_at,
          updated_at: chatHistory.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get chat history entry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching chat history entry'
    });
  }
});

// @route   POST /api/chat-history
// @desc    Create new chat history entry
// @access  Private
router.post('/', protect, validateChatHistory, async (req, res) => {
  try {
    const {
      query,
      response,
      text,
      role,
      status = 'completed',
      attachments = [],
      metadata = {},
      ai_model,
      tokens_used = 0,
      processing_time = 0,
      error_message = null
    } = req.body;

    const chatHistory = new ChatHistory({
      user_id: req.user._id,
      session_id: req.session._id,
      query,
      response,
      text,
      role,
      status,
      attachments,
      metadata,
      ai_model,
      tokens_used,
      processing_time,
      error_message
    });

    await chatHistory.save();

    res.status(201).json({
      status: 'success',
      message: 'Chat history entry created successfully',
      data: {
        chatHistory: {
          id: chatHistory._id,
          query: chatHistory.query,
          response: chatHistory.response,
          text: chatHistory.text,
          role: chatHistory.role,
          status: chatHistory.status,
          attachments: chatHistory.attachments,
          metadata: chatHistory.metadata,
          ai_model: chatHistory.ai_model,
          tokens_used: chatHistory.tokens_used,
          processing_time: chatHistory.processing_time,
          error_message: chatHistory.error_message,
          created_at: chatHistory.created_at,
          updated_at: chatHistory.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Create chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating chat history entry'
    });
  }
});

// @route   PUT /api/chat-history/:id
// @desc    Update chat history entry
// @access  Private
router.put('/:id', protect, validateChatHistory, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const chatHistory = await ChatHistory.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!chatHistory) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat history entry not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Chat history entry updated successfully',
      data: {
        chatHistory: {
          id: chatHistory._id,
          query: chatHistory.query,
          response: chatHistory.response,
          text: chatHistory.text,
          role: chatHistory.role,
          status: chatHistory.status,
          attachments: chatHistory.attachments,
          metadata: chatHistory.metadata,
          ai_model: chatHistory.ai_model,
          tokens_used: chatHistory.tokens_used,
          processing_time: chatHistory.processing_time,
          error_message: chatHistory.error_message,
          created_at: chatHistory.created_at,
          updated_at: chatHistory.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating chat history entry'
    });
  }
});

// @route   DELETE /api/chat-history/:id
// @desc    Delete chat history entry
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const chatHistory = await ChatHistory.findOneAndDelete({
      _id: id,
      user_id: req.user._id
    });

    if (!chatHistory) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat history entry not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Chat history entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting chat history entry'
    });
  }
});

export default router;
