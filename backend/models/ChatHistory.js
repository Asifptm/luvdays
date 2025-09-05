import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'file', 'audio', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: null
  }
}, {
  _id: false
});

const chatHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false, // Optional for better compatibility
    default: null
  },
  query: {
    type: String,
    required: [true, 'Query is required'],
    trim: true
  },
  response: {
    type: String,
    required: [true, 'Response is required'],
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Text content is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  attachments: [attachmentSchema],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ai_model: {
    type: String,
    default: null
  },
  tokens_used: {
    type: Number,
    default: 0
  },
  processing_time: {
    type: Number, // in milliseconds
    default: 0
  },
  error_message: {
    type: String,
    default: null
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Indexes for better query performance
chatHistorySchema.index({ user_id: 1 });
chatHistorySchema.index({ session_id: 1 });
chatHistorySchema.index({ created_at: -1 });
chatHistorySchema.index({ status: 1 });
chatHistorySchema.index({ role: 1 });

// Method to update status
chatHistorySchema.methods.updateStatus = function(status, errorMessage = null) {
  this.status = status;
  if (errorMessage) {
    this.error_message = errorMessage;
  }
  return this.save();
};

// Method to complete with response
chatHistorySchema.methods.complete = function(response, text, tokensUsed = 0, processingTime = 0) {
  this.response = response;
  this.text = text;
  this.status = 'completed';
  this.tokens_used = tokensUsed;
  this.processing_time = processingTime;
  return this.save();
};

// Method to fail with error
chatHistorySchema.methods.fail = function(errorMessage) {
  this.status = 'failed';
  this.error_message = errorMessage;
  return this.save();
};

// Static method to find chat history by user
chatHistorySchema.statics.findByUserId = function(userId, options = {}) {
  const { page = 1, limit = 50, sort = 'created_at', order = 'desc' } = options;
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  return this.find({ user_id: userId })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('session_id', 'platform device_info created_at');
};

// Static method to find chat history by session
chatHistorySchema.statics.findBySessionId = function(sessionId, options = {}) {
  const { page = 1, limit = 50, sort = 'created_at', order = 'desc' } = options;
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  return this.find({ session_id: sessionId })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));
};

// Static method to get chat statistics for a user
chatHistorySchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total_queries: { $sum: 1 },
        completed_queries: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed_queries: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        total_tokens: { $sum: '$tokens_used' },
        avg_processing_time: { $avg: '$processing_time' }
      }
    }
  ]);

  return stats[0] || {
    total_queries: 0,
    completed_queries: 0,
    failed_queries: 0,
    total_tokens: 0,
    avg_processing_time: 0
  };
};

// Static method to get recent conversations
chatHistorySchema.statics.getRecentConversations = function(userId, limit = 10) {
  return this.find({ user_id: userId, status: 'completed' })
    .sort({ created_at: -1 })
    .limit(limit)
    .select('query response created_at')
    .populate('session_id', 'platform device_info');
};

// Static method to search chat history
chatHistorySchema.statics.searchHistory = function(userId, searchTerm, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(searchTerm, 'i');

  return this.find({
    user_id: userId,
    $or: [
      { query: searchRegex },
      { response: searchRegex },
      { text: searchRegex }
    ]
  })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('session_id', 'platform device_info created_at');
};

export default mongoose.model('ChatHistory', chatHistorySchema);
