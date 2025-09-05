import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for anonymous feedback
    index: true
  },
  feedback: {
    type: String,
    enum: ['positive', 'negative'],
    required: true
  },
  comment: {
    type: String,
    maxlength: 1000,
    required: false
  },
  chatId: {
    type: String,
    required: false,
    index: true
  },
  query: {
    type: String,
    required: false
  },
  response: {
    type: String,
    required: false
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ feedback: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted date
feedbackSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString();
});

// Static method to get feedback statistics
feedbackSchema.statics.getFeedbackStats = async function(filters = {}) {
  const stats = await this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$feedback',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    positive: 0,
    negative: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Static method to get recent feedback
feedbackSchema.statics.getRecentFeedback = async function(limit = 10, filters = {}) {
  return await this.find(filters)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .select('-__v');
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
