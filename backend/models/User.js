import mongoose from 'mongoose';

const connectedAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'twitter', 'facebook', 'linkedin', 'github', 'discord', 'telegram']
  },
  username: {
    type: String,
    required: true
  },
  profile_url: {
    type: String,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  connected_accounts: [connectedAccountSchema],
  is_online: {
    type: Boolean,
    default: false
  },
  last_seen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ is_online: 1 });

// Virtual for full profile URL
userSchema.virtual('profile_url').get(function() {
  return `/users/${this.username}`;
});

// Method to update last seen
userSchema.methods.updateLastSeen = function() {
  this.last_seen = new Date();
  return this.save();
};

// Method to set online status
userSchema.methods.setOnlineStatus = function(status) {
  this.is_online = status;
  if (!status) {
    this.last_seen = new Date();
  }
  return this.save();
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

// Static method to check if email or username exists
userSchema.statics.existsByEmailOrUsername = function(identifier) {
  return this.exists({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

const User = mongoose.model('User', userSchema);

export default User;
