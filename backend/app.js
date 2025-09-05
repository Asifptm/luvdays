import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import models for session management
import Session from './models/Session.js';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/user.js';
import chatHistoryRoutes from './routes/chatHistory.js';
import chatQueriesRoutes from './routes/chatQueries.js';
import feedbackRoutes from './routes/feedback.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
            ? [ 
            'https://app.luvdays.com',
            process.env.CORS_ORIGIN
          ].filter(Boolean)
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat-history', chatHistoryRoutes);
app.use('/api/chat-queries', chatQueriesRoutes);
app.use('/api/chat/feedback', feedbackRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'AI Chat Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Session management endpoint
app.get('/api/sessions/stats', async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ is_active: true });
    const expiredSessions = await Session.countDocuments({ 
      expires_at: { $lt: new Date() } 
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        expired_sessions: expiredSessions,
        cleanup_last_run: global.lastCleanupTime || null
      }
    });
  } catch (error) {
    console.error('Session stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get session statistics'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
    
    // Initialize session cleanup on startup
    await initializeSessionCleanup();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Session cleanup function
const cleanupExpiredSessions = async () => {
  try {
    const result = await Session.cleanupExpired();
    global.lastCleanupTime = new Date();
    console.log(`🧹 Cleaned up ${result.modifiedCount} expired sessions`);
  } catch (error) {
    console.error('❌ Session cleanup error:', error);
  }
};

// Initialize session cleanup
const initializeSessionCleanup = async () => {
  // Run initial cleanup
  await cleanupExpiredSessions();
  
  // Set up periodic cleanup (every 6 hours)
  setInterval(cleanupExpiredSessions, 6 * 60 * 60 * 1000);
  
  console.log('✅ Session cleanup initialized (runs every 6 hours)');
};

export { app, connectDB };
