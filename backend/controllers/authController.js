import User from '../models/User.js';
import Session from '../models/Session.js';
import { createSession, generateAuthToken } from '../middleware/auth.js';

// Helper function to get device info
const getDeviceInfo = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Simple browser detection
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Simple OS detection
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return {
    ip,
    browser,
    os
  };
};

// Check if user exists by email or username
export const checkUserExists = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be email or username
    
    if (!identifier) {
      return res.status(400).json({
        status: 'error',
        message: 'Email or username is required'
      });
    }

    const user = await User.findByEmailOrUsername(identifier);
    
    if (user) {
      return res.status(200).json({
        status: 'success',
        message: 'User found',
        data: {
          exists: true,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            name: user.name
          }
        }
      });
    } else {
      return res.status(200).json({
        status: 'success',
        message: 'User not found',
        data: {
          exists: false
        }
      });
    }
  } catch (error) {
    console.error('Check user exists error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { email, username, name, connected_accounts } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email) || 
                        await User.findByEmailOrUsername(username);
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      username,
      name,
      connected_accounts: connected_accounts || []
    });

    await user.save();

    // Create session
    const deviceInfo = getDeviceInfo(req);
    const session = await createSession(user._id, 'web', deviceInfo, 'email');

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          connected_accounts: user.connected_accounts,
          created_at: user.createdAt
        },
        session: {
          id: session._id,
          auth_token: session.auth_token,
          expires_at: session.expires_at,
          platform: session.platform,
          login_method: session.login_method
        }
      }
    });
  } catch (error) {
    console.error('Register user error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' ? 'Email already registered' : 'Username already taken';
      return res.status(400).json({
        status: 'error',
        message
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be email or username
    
    if (!identifier) {
      return res.status(400).json({
        status: 'error',
        message: 'Email or username is required'
      });
    }

    // Find user by email or username
    const user = await User.findByEmailOrUsername(identifier);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email/username or user not found'
      });
    }

    // Update online status
    await user.setOnlineStatus(true);

    // Create session
    const deviceInfo = getDeviceInfo(req);
    const session = await createSession(user._id, 'web', deviceInfo, 'email');

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          connected_accounts: user.connected_accounts,
          is_online: user.is_online,
          last_seen: user.last_seen,
          created_at: user.createdAt
        },
        session: {
          id: session._id,
          auth_token: session.auth_token,
          expires_at: session.expires_at,
          platform: session.platform,
          login_method: session.login_method
        }
      }
    });
  } catch (error) {
    console.error('Login user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          connected_accounts: user.connected_accounts,
          is_online: user.is_online,
          last_seen: user.last_seen,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, connected_accounts } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (connected_accounts) updateData.connected_accounts = connected_accounts;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          name: user.name,
          connected_accounts: user.connected_accounts,
          is_online: user.is_online,
          last_seen: user.last_seen,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { user_id: req.user.id, auth_token: req.headers.authorization?.split(' ')[1] },
      { is_active: false },
      { new: true }
    );

    if (session) {
      // Update user online status
      await User.findByIdAndUpdate(req.user.id, { is_online: false });
    }

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user sessions
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.user.id, is_active: true })
      .sort({ created_at: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Sessions retrieved successfully',
      data: {
        sessions: sessions.map(session => ({
          id: session._id,
          platform: session.platform,
          device_info: session.device_info,
          login_method: session.login_method,
          created_at: session.created_at,
          last_activity_at: session.last_activity_at,
          expires_at: session.expires_at
        }))
      }
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Revoke session
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findOneAndUpdate(
      { _id: sessionId, user_id: req.user.id },
      { is_active: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Generate new token
export const generateNewToken = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required'
      });
    }

    const newAuthToken = generateAuthToken();
    
    const session = await Session.findByIdAndUpdate(
      sessionId,
      {
        auth_token: newAuthToken,
        last_activity_at: new Date()
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'New token generated successfully',
      data: {
        session: {
          id: session._id,
          auth_token: session.auth_token,
          expires_at: session.expires_at,
          platform: session.platform,
          login_method: session.login_method
        }
      }
    });
  } catch (error) {
    console.error('Generate new token error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Refresh session
export const refreshSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { user_id: req.user.id, auth_token: req.headers.authorization?.split(' ')[1] },
      {
        last_activity_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Extend by 7 days
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Session refreshed successfully',
      data: {
        session: {
          id: session._id,
          auth_token: session.auth_token,
          expires_at: session.expires_at,
          platform: session.platform,
          login_method: session.login_method
        }
      }
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Test token generation (public endpoint)
export const testTokenGeneration = async (req, res) => {
  try {
    const testToken = generateAuthToken();
    
    res.status(200).json({
      status: 'success',
      message: 'Token generation test successful',
      data: {
        test_token: testToken,
        token_length: testToken.length,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Test token generation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
