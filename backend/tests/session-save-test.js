import mongoose from 'mongoose';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { createSession, generateAuthToken } from '../middleware/auth.js';

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_chat_app';

describe('Session Save Tests', () => {
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
    
    // Create a test user
    testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User'
    });
    await testUser.save();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'test@example.com' });
    await Session.deleteMany({ user_id: testUser._id });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up sessions before each test
    await Session.deleteMany({ user_id: testUser._id });
  });

  describe('Session Creation and Saving', () => {
    test('should create and save session when user logs in', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      // Simulate login - create session
      const session = await createSession(
        testUser._id,
        'web',
        deviceInfo,
        'email'
      );

      // Verify session was saved to database
      const savedSession = await Session.findById(session._id);
      expect(savedSession).toBeDefined();
      expect(savedSession.user_id.toString()).toBe(testUser._id.toString());
      expect(savedSession.platform).toBe('web');
      expect(savedSession.auth_token).toBe(session.auth_token);
      expect(savedSession.is_active).toBe(true);
    });

    test('should create and save session when user registers', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Firefox',
        os: 'macOS'
      };

      // Simulate registration - create session
      const session = await createSession(
        testUser._id,
        'web',
        deviceInfo,
        'email'
      );

      // Verify session was saved to database
      const savedSession = await Session.findById(session._id);
      expect(savedSession).toBeDefined();
      expect(savedSession.user_id.toString()).toBe(testUser._id.toString());
      expect(savedSession.platform).toBe('web');
      expect(savedSession.auth_token).toBe(session.auth_token);
      expect(savedSession.is_active).toBe(true);
    });

    test('should save session with correct device information', async () => {
      const deviceInfo = {
        ip: '192.168.1.100',
        browser: 'Safari',
        os: 'iOS',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        deviceType: 'mobile'
      };

      const session = await createSession(
        testUser._id,
        'mobile',
        deviceInfo,
        'email'
      );

      const savedSession = await Session.findById(session._id);
      expect(savedSession.device_info.ip).toBe('192.168.1.100');
      expect(savedSession.device_info.browser).toBe('Safari');
      expect(savedSession.device_info.os).toBe('iOS');
      expect(savedSession.device_info.userAgent).toBe('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
      expect(savedSession.device_info.deviceType).toBe('mobile');
    });

    test('should save session with correct expiration date', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(
        testUser._id,
        'web',
        deviceInfo,
        'email'
      );

      const savedSession = await Session.findById(session._id);
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000);

      // Allow for 1 second difference due to timing
      const timeDiff = Math.abs(savedSession.expires_at.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });

    test('should save multiple sessions for the same user', async () => {
      const deviceInfo1 = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const deviceInfo2 = {
        ip: '192.168.1.100',
        browser: 'Firefox',
        os: 'Linux'
      };

      // Create two sessions for the same user
      const session1 = await createSession(testUser._id, 'web', deviceInfo1, 'email');
      const session2 = await createSession(testUser._id, 'desktop', deviceInfo2, 'email');

      // Verify both sessions were saved
      const savedSessions = await Session.find({ user_id: testUser._id });
      expect(savedSessions).toHaveLength(2);
      expect(savedSessions[0].auth_token).not.toBe(savedSessions[1].auth_token);
    });
  });

  describe('Session Data Integrity', () => {
    test('should save session with unique auth token', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session1 = await createSession(testUser._id, 'web', deviceInfo, 'email');
      const session2 = await createSession(testUser._id, 'web', deviceInfo, 'email');

      expect(session1.auth_token).not.toBe(session2.auth_token);
      
      // Verify both tokens are saved in database
      const savedSession1 = await Session.findById(session1._id);
      const savedSession2 = await Session.findById(session2._id);
      
      expect(savedSession1.auth_token).toBe(session1.auth_token);
      expect(savedSession2.auth_token).toBe(session2.auth_token);
    });

    test('should save session with correct metadata', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(
        testUser._id,
        'web',
        deviceInfo,
        'email'
      );

      const savedSession = await Session.findById(session._id);
      expect(savedSession.login_method).toBe('email');
      expect(savedSession.platform).toBe('web');
      expect(savedSession.is_active).toBe(true);
      expect(savedSession.last_activity_at).toBeDefined();
    });
  });
});

console.log('Session save tests completed successfully!');
