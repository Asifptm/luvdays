import mongoose from 'mongoose';

const deviceInfoSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: [true, 'IP address is required']
  },
  browser: {
    type: String,
    required: [true, 'Browser information is required']
  },
  os: {
    type: String,
    required: [true, 'Operating system information is required']
  },
  userAgent: {
    type: String,
    default: null
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  }
}, {
  _id: false
});

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    enum: ['web', 'mobile', 'desktop', 'api']
  },
  device_info: deviceInfoSchema,
  auth_token: {
    type: String,
    required: [true, 'Auth token is required'],
    unique: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_activity_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  login_method: {
    type: String,
    enum: ['email', 'social', 'api'],
    default: 'email'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Indexes for better query performance
sessionSchema.index({ user_id: 1 });
sessionSchema.index({ auth_token: 1 });
sessionSchema.index({ is_active: 1 });
sessionSchema.index({ expires_at: 1 });
sessionSchema.index({ last_activity_at: 1 });

// Method to check if session is expired
sessionSchema.methods.isExpired = function() {
  return new Date() > this.expires_at;
};

// Method to update last activity
sessionSchema.methods.updateActivity = function() {
  this.last_activity_at = new Date();
  return this.save();
};

// Method to deactivate session
sessionSchema.methods.deactivate = function() {
  this.is_active = false;
  return this.save();
};

// Static method to find active sessions for a user
sessionSchema.statics.findActiveByUserId = function(userId) {
  return this.find({
    user_id: userId,
    is_active: true,
    expires_at: { $gt: new Date() }
  }).sort({ last_activity_at: -1 });
};

// Static method to find session by auth token
sessionSchema.statics.findByAuthToken = function(authToken) {
  return this.findOne({
    auth_token: authToken,
    is_active: true,
    expires_at: { $gt: new Date() }
  });
};

// Static method to clean up expired sessions
sessionSchema.statics.cleanupExpired = async function() {
  return this.updateMany(
    { expires_at: { $lt: new Date() } },
    { is_active: false }
  );
};

// Static method to deactivate all sessions for a user
sessionSchema.statics.deactivateAllForUser = function(userId) {
  return this.updateMany(
    { user_id: userId, is_active: true },
    { is_active: false }
  );
};

// Pre-save middleware to set expiration if not provided
sessionSchema.pre('save', function(next) {
  if (!this.expires_at) {
    // Default to 23 days from now
    this.expires_at = new Date(Date.now() + 23 * 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model('Session', sessionSchema);
