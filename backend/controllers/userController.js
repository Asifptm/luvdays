import User from '../models/User.js';
import Session from '../models/Session.js';

// Check if user exists
const checkUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const query = {
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    };

    const users = await User.find(query)
      .select('name email created_at')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name email connected_accounts created_at updated_at');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          connected_accounts: user.connected_accounts,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get online users
export const getOnlineUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get users with active sessions
    const activeSessions = await Session.find({ 
      is_active: true,
      expires_at: { $gt: new Date() }
    }).select('user_id last_activity_at');

    const userIds = [...new Set(activeSessions.map(session => session.user_id))];

    const users = await User.find({ _id: { $in: userIds } })
      .select('name email created_at')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ _id: { $in: userIds } });

    // Add last activity info
    const usersWithActivity = users.map(user => {
      const session = activeSessions.find(s => s.user_id.toString() === user._id.toString());
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        last_activity: session?.last_activity_at
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        users: usersWithActivity,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get recent users
export const getRecentUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('name email created_at')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('name email connected_accounts created_at updated_at')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          connected_accounts: user.connected_accounts,
          created_at: user.created_at,
          updated_at: user.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSessions = await Session.countDocuments({ 
      is_active: true,
      expires_at: { $gt: new Date() }
    });

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      created_at: { $gte: thirtyDaysAgo }
    });

    // Get users with connected accounts
    const usersWithAccounts = await User.countDocuments({
      'connected_accounts.0': { $exists: true }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          activeSessions,
          recentUsers,
          usersWithAccounts,
          usersWithoutAccounts: totalUsers - usersWithAccounts
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Delete user's sessions
    await Session.deleteMany({ user_id: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, connected_accounts } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already taken'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (connected_accounts) user.connected_accounts = connected_accounts;
    
    user.updated_at = new Date();
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          connected_accounts: user.connected_accounts,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};
