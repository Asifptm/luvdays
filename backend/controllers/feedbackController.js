import Feedback from '../models/Feedback.js';
import ChatHistory from '../models/ChatHistory.js';

// Submit feedback for a chat response
export const submitFeedback = async (req, res) => {
  try {
    const { messageId, feedback, comment } = req.body;
    const userId = req.user?.id; // Optional auth

    // Validate required fields
    if (!messageId || !feedback) {
      return res.status(400).json({
        status: 'error',
        message: 'messageId and feedback are required'
      });
    }

    // Validate feedback type
    if (!['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({
        status: 'error',
        message: 'feedback must be either "positive" or "negative"'
      });
    }

    // Validate comment length
    if (comment && comment.length > 1000) {
      return res.status(400).json({
        status: 'error',
        message: 'comment must be less than 1000 characters'
      });
    }

    // Check if feedback already exists for this message
    const existingFeedback = await Feedback.findOne({ messageId });
    if (existingFeedback) {
      return res.status(409).json({
        status: 'error',
        message: 'Feedback already submitted for this message'
      });
    }

    // Try to find the chat history entry to get additional context
    let chatHistoryEntry = null;
    try {
      chatHistoryEntry = await ChatHistory.findOne({ 
        $or: [
          { _id: messageId },
          { 'metadata.messageId': messageId }
        ]
      });
    } catch (error) {
      // Chat history entry not found, but that's okay
      console.log('Chat history entry not found for messageId:', messageId);
    }

    // Create feedback entry
    const feedbackData = {
      messageId,
      feedback,
      comment,
      userId,
      chatId: chatHistoryEntry?.chatId || null,
      query: chatHistoryEntry?.query || null,
      response: chatHistoryEntry?.response || null,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        sessionId: req.session?.id || null
      }
    };

    const newFeedback = new Feedback(feedbackData);
    await newFeedback.save();

    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: {
        id: newFeedback._id,
        messageId: newFeedback.messageId,
        feedback: newFeedback.feedback,
        submittedAt: newFeedback.createdAt
      }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get feedback statistics
export const getFeedbackStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const filters = {};

    // Add date filters if provided
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.createdAt.$lte = new Date(endDate);
      }
    }

    // Add user filter if provided
    if (userId) {
      filters.userId = userId;
    }

    const stats = await Feedback.getFeedbackStats(filters);

    res.status(200).json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get recent feedback
export const getRecentFeedback = async (req, res) => {
  try {
    const { limit = 10, page = 1, feedback } = req.query;
    const skip = (page - 1) * limit;
    const filters = {};

    // Add feedback type filter if provided
    if (feedback && ['positive', 'negative'].includes(feedback)) {
      filters.feedback = feedback;
    }

    const feedbackList = await Feedback.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .select('-__v');

    const total = await Feedback.countDocuments(filters);

    res.status(200).json({
      status: 'success',
      data: {
        feedback: feedbackList,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get recent feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get feedback for a specific message
export const getMessageFeedback = async (req, res) => {
  try {
    const { messageId } = req.params;

    const feedback = await Feedback.findOne({ messageId })
      .populate('userId', 'name email')
      .select('-__v');

    if (!feedback) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found for this message'
      });
    }

    res.status(200).json({
      status: 'success',
      data: feedback
    });

  } catch (error) {
    console.error('Get message feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Delete feedback (admin only)
export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback not found'
      });
    }

    // Check if user owns the feedback or is admin
    if (feedback.userId?.toString() !== userId) {
      // You might want to add admin role check here
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this feedback'
      });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    res.status(200).json({
      status: 'success',
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};
