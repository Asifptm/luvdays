import mongoose from 'mongoose';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { createSession, generateAuthToken } from '../middleware/auth.js';

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_chat_app';

describe('Session Management Tests', () => {
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

  describe('Session Creation', () => {
    test('should create a new session with valid data', async () => {
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

      expect(session).toBeDefined();
      expect(session.user_id.toString()).toBe(testUser._id.toString());
      expect(session.platform).toBe('web');
      expect(session.device_info.ip).toBe('127.0.0.1');
      expect(session.device_info.browser).toBe('Chrome');
      expect(session.device_info.os).toBe('Windows');
      expect(session.login_method).toBe('email');
      expect(session.is_active).toBe(true);
      expect(session.auth_token).toBeDefined();
      expect(session.expires_at).toBeDefined();
    });

    test('should generate unique auth tokens', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session1 = await createSession(testUser._id, 'web', deviceInfo, 'email');
      const session2 = await createSession(testUser._id, 'web', deviceInfo, 'email');

      expect(session1.auth_token).not.toBe(session2.auth_token);
    });

    test('should set expiration date to 7 days from creation', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(testUser._id, 'web', deviceInfo, 'email');
      const now = new Date();
      const expectedExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Allow for 1 second difference due to timing
      const timeDiff = Math.abs(session.expires_at.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('Session Validation', () => {
    test('should find active session by auth token', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(testUser._id, 'web', deviceInfo, 'email');
      const foundSession = await Session.findByAuthToken(session.auth_token);

      expect(foundSession).toBeDefined();
      expect(foundSession._id.toString()).toBe(session._id.toString());
    });

    test('should not find inactive session by auth token', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(testUser._id, 'web', deviceInfo, 'email');
      session.is_active = false;
      await session.save();

      const foundSession = await Session.findByAuthToken(session.auth_token);
      expect(foundSession).toBeNull();
    });

    test('should not find expired session by auth token', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(testUser._id, 'web', deviceInfo, 'email');
      session.expires_at = new Date(Date.now() - 1000); // Expired 1 second ago
      await session.save();

      const foundSession = await Session.findByAuthToken(session.auth_token);
      expect(foundSession).toBeNull();
    });
  });

  describe('Session Management', () => {
    test('should update last activity when updateActivity is called', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(testUser._id, 'web', deviceInfo, 'email');
      const originalActivity = session.last_activity_at;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await session.updateActivity();
      await session.reload();

      expect(session.last_activity_at.getTime()).toBeGreaterThan(originalActivity.getTime());
    });

    test('should deactivate session when deactivate is called', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      const session = await createSession(testUser._id, 'web', deviceInfo, 'email');
      expect(session.is_active).toBe(true);

      await session.deactivate();
      await session.reload();

      expect(session.is_active).toBe(false);
    });

    test('should find all active sessions for a user', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      // Create multiple sessions
      await createSession(testUser._id, 'web', deviceInfo, 'email');
      await createSession(testUser._id, 'mobile', deviceInfo, 'email');
      
      // Create an inactive session
      const inactiveSession = await createSession(testUser._id, 'desktop', deviceInfo, 'email');
      inactiveSession.is_active = false;
      await inactiveSession.save();

      const activeSessions = await Session.findActiveByUserId(testUser._id);
      expect(activeSessions).toHaveLength(2);
      expect(activeSessions.every(session => session.is_active)).toBe(true);
    });
  });

  describe('Session Cleanup', () => {
    test('should clean up expired sessions', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      // Create active session
      await createSession(testUser._id, 'web', deviceInfo, 'email');

      // Create expired session
      const expiredSession = new Session({
        user_id: testUser._id,
        platform: 'web',
        device_info: deviceInfo,
        auth_token: generateAuthToken(),
        login_method: 'email',
        expires_at: new Date(Date.now() - 1000) // Expired 1 second ago
      });
      await expiredSession.save();

      const result = await Session.cleanupExpired();
      expect(result.modifiedCount).toBeGreaterThan(0);

      // Verify expired session is now inactive
      await expiredSession.reload();
      expect(expiredSession.is_active).toBe(false);
    });

    test('should deactivate all sessions for a user', async () => {
      const deviceInfo = {
        ip: '127.0.0.1',
        browser: 'Chrome',
        os: 'Windows'
      };

      // Create multiple sessions
      await createSession(testUser._id, 'web', deviceInfo, 'email');
      await createSession(testUser._id, 'mobile', deviceInfo, 'email');

      const result = await Session.deactivateAllForUser(testUser._id);
      expect(result.modifiedCount).toBe(2);

      // Verify all sessions are now inactive
      const activeSessions = await Session.findActiveByUserId(testUser._id);
      expect(activeSessions).toHaveLength(0);
    });
  });

  describe('Auth Token Generation', () => {
    test('should generate unique auth tokens', () => {
      const token1 = generateAuthToken();
      const token2 = generateAuthToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
      expect(token1.length).toBeGreaterThan(20);
    });

    test('should generate tokens with expected format', () => {
      const token = generateAuthToken();
      expect(token).toMatch(/^token_\d+_[a-z0-9]+$/);
    });
  });
});

console.log('Session management tests completed successfully!');
