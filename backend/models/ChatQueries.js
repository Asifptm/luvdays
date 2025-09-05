import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for anonymous users
    default: null
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false, // Optional for anonymous users
    default: null
  },
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
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
  ai_model: {
    type: String,
    default: 'gpt-3.5-turbo'
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
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  is_favorite: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
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
querySchema.index({ user_id: 1 });
querySchema.index({ session_id: 1 });
querySchema.index({ chat_id: 1 });
querySchema.index({ created_at: -1 });
querySchema.index({ status: 1 });
querySchema.index({ role: 1 });
querySchema.index({ category: 1 });
querySchema.index({ tags: 1 });
querySchema.index({ is_favorite: 1 });

// Method to update status
querySchema.methods.updateStatus = function(status, errorMessage = null) {
  this.status = status;
  if (errorMessage) {
    this.error_message = errorMessage;
  }
  return this.save();
};

// Method to complete with response
querySchema.methods.complete = function(response, tokensUsed = 0, processingTime = 0) {
  this.response = response;
  this.status = 'completed';
  this.tokens_used = tokensUsed;
  this.processing_time = processingTime;
  return this.save();
};

// Method to fail with error
querySchema.methods.fail = function(errorMessage) {
  this.status = 'failed';
  this.error_message = errorMessage;
  return this.save();
};

// Method to add rating and feedback
querySchema.methods.addFeedback = function(rating, feedback = null) {
  this.rating = rating;
  this.feedback = feedback;
  return this.save();
};

// Method to toggle favorite status
querySchema.methods.toggleFavorite = function() {
  this.is_favorite = !this.is_favorite;
  return this.save();
};

// Method to add tags
querySchema.methods.addTags = function(tags) {
  const newTags = Array.isArray(tags) ? tags : [tags];
  this.tags = [...new Set([...this.tags, ...newTags])];
  return this.save();
};

// Method to remove tags
querySchema.methods.removeTags = function(tags) {
  const tagsToRemove = Array.isArray(tags) ? tags : [tags];
  this.tags = this.tags.filter(tag => !tagsToRemove.includes(tag));
  return this.save();
};

// Static method to find queries by user
querySchema.statics.findByUserId = function(userId, options = {}) {
  const { page = 1, limit = 50, sort = 'created_at', order = 'desc', status, category } = options;
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const filter = { user_id: userId };
  if (status) filter.status = status;
  if (category) filter.category = category;

  return this.find(filter)
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('session_id', 'platform device_info created_at')
    .populate('chat_id', 'chatName chatType');
};

// Static method to find queries by session
querySchema.statics.findBySessionId = function(sessionId, options = {}) {
  const { page = 1, limit = 50, sort = 'created_at', order = 'desc' } = options;
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  return this.find({ session_id: sessionId })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));
};

// Static method to find favorite queries
querySchema.statics.findFavorites = function(userId, options = {}) {
  const { page = 1, limit = 50, sort = 'created_at', order = 'desc' } = options;
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  return this.find({ user_id: userId, is_favorite: true })
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('session_id', 'platform device_info created_at');
};

// Static method to search queries
querySchema.statics.searchQueries = function(userId, searchTerm, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(searchTerm, 'i');

  return this.find({
    user_id: userId,
    $or: [
      { query: searchRegex },
      { response: searchRegex },
      { tags: searchRegex },
      { category: searchRegex }
    ]
  })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('session_id', 'platform device_info created_at');
};

// Static method to get query statistics for a user
querySchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total_queries: { $sum: 1 },
        completed_queries: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed_queries: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        total_tokens: { $sum: '$tokens_used' },
        avg_processing_time: { $avg: '$processing_time' },
        favorite_queries: { $sum: { $cond: ['$is_favorite', 1, 0] } },
        avg_rating: { $avg: '$rating' }
      }
    }
  ]);

  return stats[0] || {
    total_queries: 0,
    completed_queries: 0,
    failed_queries: 0,
    total_tokens: 0,
    avg_processing_time: 0,
    favorite_queries: 0,
    avg_rating: 0
  };
};

// Static method to get popular categories
querySchema.statics.getPopularCategories = function(userId, limit = 10) {
  return this.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get popular tags
querySchema.statics.getPopularTags = function(userId, limit = 20) {
  return this.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

export default mongoose.model('ChatQueries', querySchema);
