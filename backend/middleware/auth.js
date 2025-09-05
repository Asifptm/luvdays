import Session from '../models/Session.js';
import User from '../models/User.js';

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let authToken;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    authToken = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!authToken) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Find session by auth token
    const session = await Session.findByAuthToken(authToken);
    
    if (!session) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired session'
      });
    }

    // Get user from session
    const user = await User.findById(session.user_id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update session activity
    await session.updateActivity();

    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
};

// Optional auth - doesn't require authentication but adds user if available
const optionalAuth = async (req, res, next) => {
  let authToken;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    authToken = req.headers.authorization.split(' ')[1];
  }

  if (authToken) {
    try {
      const session = await Session.findByAuthToken(authToken);
      if (session) {
        const user = await User.findById(session.user_id);
        if (user) {
          req.user = user;
          req.session = session;
          await session.updateActivity();
        }
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Invalid token in optional auth:', error.message);
    }
  }

  next();
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Generate auth token (simple UUID-like string)
const generateAuthToken = () => {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const createSession = async (userId, platform, deviceInfo, loginMethod = 'email') => {
  const authToken = generateAuthToken();
  
  const session = new Session({
    user_id: userId,
    platform,
    device_info: deviceInfo,
    auth_token: authToken,
    login_method: loginMethod,
    expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000) // 23 days
  });

  await session.save();
  return session;
};

export {
  protect,
  optionalAuth,
  authorize,
  generateAuthToken,
  createSession
};
