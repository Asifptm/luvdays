import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  isAI: {
    type: Boolean,
    default: false
  },
  aiModel: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  chatType: {
    type: String,
    enum: ['direct', 'group', 'ai'],
    default: 'direct'
  },
  chatName: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: String,
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  aiSettings: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 1000
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ chatType: 1 });
chatSchema.index({ isActive: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Virtual for unread count
chatSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(message => 
    !message.readBy.some(read => read.user.toString() === this.participants[0].toString())
  ).length;
});

// Method to add message
chatSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastMessage = messageData.content;
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  const unreadMessages = this.messages.filter(message => 
    !message.readBy.some(read => read.user.toString() === userId.toString())
  );

  unreadMessages.forEach(message => {
    message.readBy.push({
      user: userId,
      readAt: new Date()
    });
  });

  return this.save();
};

// Static method to find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function(userId1, userId2) {
  let chat = await this.findOne({
    participants: { $all: [userId1, userId2] },
    chatType: 'direct',
    isActive: true
  });

  if (!chat) {
    chat = new this({
      participants: [userId1, userId2],
      chatType: 'direct',
      messages: []
    });
    await chat.save();
  }

  return chat;
};

// Static method to find or create AI chat
chatSchema.statics.findOrCreateAIChat = async function(userId, aiSettings = {}) {
  let chat = await this.findOne({
    participants: userId,
    chatType: 'ai',
    isActive: true
  });

  if (!chat) {
    chat = new this({
      participants: [userId],
      chatType: 'ai',
      chatName: 'AI Assistant',
      aiSettings: { ...this.schema.path('aiSettings').defaultValue(), ...aiSettings },
      messages: []
    });
    await chat.save();
  }

  return chat;
};

export default mongoose.model('Chat', chatSchema);
