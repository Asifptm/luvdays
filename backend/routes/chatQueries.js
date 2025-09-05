import express from 'express';
import ChatQueries from '../models/ChatQueries.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation for ChatQueries
const validateChatQuery = [
  body('query').notEmpty().withMessage('Query is required'),
  body('response').notEmpty().withMessage('Response is required'),
  body('role').isIn(['user', 'assistant', 'system']).withMessage('Invalid role'),
  body('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

// @route   GET /api/chat-queries
// @desc    Get all chat queries for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = 'created_at', order = 'desc', status, category, priority } = req.query;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const filter = { user_id: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const chatQueries = await ChatQueries.find(filter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('session_id', 'platform device_info created_at')
      .populate('chat_id', 'chatName chatType');

    const totalCount = await ChatQueries.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        chatQueries: chatQueries.map(query => ({
          id: query._id,
          query: query.query,
          response: query.response,
          role: query.role,
          status: query.status,
          ai_model: query.ai_model,
          tokens_used: query.tokens_used,
          processing_time: query.processing_time,
          error_message: query.error_message,
          metadata: query.metadata,
          tags: query.tags,
          category: query.category,
          priority: query.priority,
          is_favorite: query.is_favorite,
          rating: query.rating,
          feedback: query.feedback,
          session: query.session_id,
          chat: query.chat_id,
          created_at: query.created_at,
          updated_at: query.updated_at
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
    console.error('Get chat queries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching chat queries'
    });
  }
});

// @route   GET /api/chat-queries/:id
// @desc    Get specific chat query
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const chatQuery = await ChatQueries.findOne({
      _id: id,
      user_id: req.user._id
    }).populate('session_id', 'platform device_info created_at')
      .populate('chat_id', 'chatName chatType');

    if (!chatQuery) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat query not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        chatQuery: {
          id: chatQuery._id,
          query: chatQuery.query,
          response: chatQuery.response,
          role: chatQuery.role,
          status: chatQuery.status,
          ai_model: chatQuery.ai_model,
          tokens_used: chatQuery.tokens_used,
          processing_time: chatQuery.processing_time,
          error_message: chatQuery.error_message,
          metadata: chatQuery.metadata,
          tags: chatQuery.tags,
          category: chatQuery.category,
          priority: chatQuery.priority,
          is_favorite: chatQuery.is_favorite,
          rating: chatQuery.rating,
          feedback: chatQuery.feedback,
          session: chatQuery.session_id,
          chat: chatQuery.chat_id,
          created_at: chatQuery.created_at,
          updated_at: chatQuery.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get chat query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching chat query'
    });
  }
});

// @route   POST /api/chat-queries
// @desc    Create new chat query
// @access  Private
router.post('/', protect, validateChatQuery, async (req, res) => {
  try {
    const {
      query,
      response,
      role,
      status = 'completed',
      ai_model = 'fastapi-rag',
      tokens_used = 0,
      processing_time = 0,
      error_message = null,
      metadata = {},
      tags = [],
      category = 'general',
      priority = 'medium',
      chat_id = null
    } = req.body;

    const chatQuery = new ChatQueries({
      user_id: req.user._id,
      session_id: req.session._id,
      chat_id,
      query,
      response,
      role,
      status,
      ai_model,
      tokens_used,
      processing_time,
      error_message,
      metadata,
      tags,
      category,
      priority
    });

    await chatQuery.save();

    res.status(201).json({
      status: 'success',
      message: 'Chat query created successfully',
      data: {
        chatQuery: {
          id: chatQuery._id,
          query: chatQuery.query,
          response: chatQuery.response,
          role: chatQuery.role,
          status: chatQuery.status,
          ai_model: chatQuery.ai_model,
          tokens_used: chatQuery.tokens_used,
          processing_time: chatQuery.processing_time,
          error_message: chatQuery.error_message,
          metadata: chatQuery.metadata,
          tags: chatQuery.tags,
          category: chatQuery.category,
          priority: chatQuery.priority,
          is_favorite: chatQuery.is_favorite,
          rating: chatQuery.rating,
          feedback: chatQuery.feedback,
          created_at: chatQuery.created_at,
          updated_at: chatQuery.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Create chat query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating chat query'
    });
  }
});

// @route   PUT /api/chat-queries/:id
// @desc    Update chat query
// @access  Private
router.put('/:id', protect, validateChatQuery, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const chatQuery = await ChatQueries.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!chatQuery) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat query not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Chat query updated successfully',
      data: {
        chatQuery: {
          id: chatQuery._id,
          query: chatQuery.query,
          response: chatQuery.response,
          role: chatQuery.role,
          status: chatQuery.status,
          ai_model: chatQuery.ai_model,
          tokens_used: chatQuery.tokens_used,
          processing_time: chatQuery.processing_time,
          error_message: chatQuery.error_message,
          metadata: chatQuery.metadata,
          tags: chatQuery.tags,
          category: chatQuery.category,
          priority: chatQuery.priority,
          is_favorite: chatQuery.is_favorite,
          rating: chatQuery.rating,
          feedback: chatQuery.feedback,
          created_at: chatQuery.created_at,
          updated_at: chatQuery.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update chat query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating chat query'
    });
  }
});

// @route   DELETE /api/chat-queries/:id
// @desc    Delete chat query
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const chatQuery = await ChatQueries.findOneAndDelete({
      _id: id,
      user_id: req.user._id
    });

    if (!chatQuery) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat query not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Chat query deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting chat query'
    });
  }
});

// @route   GET /api/chat-queries/favorites
// @desc    Get favorite chat queries
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const chatQueries = await ChatQueries.findFavorites(req.user._id, { page, limit });

    res.json({
      status: 'success',
      data: {
        chatQueries: chatQueries.map(query => ({
          id: query._id,
          query: query.query,
          response: query.response,
          role: query.role,
          status: query.status,
          ai_model: query.ai_model,
          tokens_used: query.tokens_used,
          processing_time: query.processing_time,
          error_message: query.error_message,
          metadata: query.metadata,
          tags: query.tags,
          category: query.category,
          priority: query.priority,
          is_favorite: query.is_favorite,
          rating: query.rating,
          feedback: query.feedback,
          session: query.session_id,
          chat: query.chat_id,
          created_at: query.created_at,
          updated_at: query.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: chatQueries.length,
          pages: Math.ceil(chatQueries.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get favorite chat queries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching favorite chat queries'
    });
  }
});

// @route   POST /api/chat-queries/:id/favorite
// @desc    Toggle favorite status for chat query
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const chatQuery = await ChatQueries.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!chatQuery) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat query not found'
      });
    }

    await chatQuery.toggleFavorite();

    res.json({
      status: 'success',
      message: `Chat query ${chatQuery.is_favorite ? 'added to' : 'removed from'} favorites`,
      data: {
        is_favorite: chatQuery.is_favorite
      }
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while toggling favorite status'
    });
  }
});

// @route   POST /api/chat-queries/:id/feedback
// @desc    Add rating and feedback for chat query
// @access  Private
router.post('/:id/feedback', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isString().withMessage('Feedback must be a string')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const chatQuery = await ChatQueries.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!chatQuery) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat query not found'
      });
    }

    await chatQuery.addFeedback(rating, feedback);

    res.json({
      status: 'success',
      message: 'Feedback added successfully',
      data: {
        rating: chatQuery.rating,
        feedback: chatQuery.feedback
      }
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while adding feedback'
    });
  }
});

// @route   GET /api/chat-queries/search
// @desc    Search chat queries
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

    const searchResults = await ChatQueries.searchQueries(req.user._id, q, { page, limit });

    res.json({
      status: 'success',
      data: {
        chatQueries: searchResults.map(query => ({
          id: query._id,
          query: query.query,
          response: query.response,
          role: query.role,
          status: query.status,
          ai_model: query.ai_model,
          tokens_used: query.tokens_used,
          processing_time: query.processing_time,
          error_message: query.error_message,
          metadata: query.metadata,
          tags: query.tags,
          category: query.category,
          priority: query.priority,
          is_favorite: query.is_favorite,
          rating: query.rating,
          feedback: query.feedback,
          session: query.session_id,
          chat: query.chat_id,
          created_at: query.created_at,
          updated_at: query.updated_at
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
    console.error('Search chat queries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching chat queries'
    });
  }
});

// @route   GET /api/chat-queries/stats
// @desc    Get chat queries statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await ChatQueries.getUserStats(req.user._id);

    res.json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get chat queries stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching chat queries statistics'
    });
  }
});

// @route   GET /api/chat-queries/categories
// @desc    Get all categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = await ChatQueries.getPopularCategories(req.user._id, 20);

    res.json({
      status: 'success',
      data: {
        categories: categories.map(cat => ({
          name: cat._id,
          count: cat.count
        }))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/chat-queries/tags
// @desc    Get all tags
// @access  Private
router.get('/tags', protect, async (req, res) => {
  try {
    const tags = await ChatQueries.getPopularTags(req.user._id, 50);

    res.json({
      status: 'success',
      data: {
        tags: tags.map(tag => ({
          name: tag._id,
          count: tag.count
        }))
      }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching tags'
    });
  }
});

export default router;
