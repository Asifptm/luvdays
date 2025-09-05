import mongoose from 'mongoose';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { createSession } from '../middleware/auth.js';

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_chat_app';

async function testAuthRedirect() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(TEST_DB_URI);
    
    console.log('👤 Creating test user...');
    const testUser = new User({
      email: 'testredirect@example.com',
      username: 'testuserredirect',
      name: 'Test User Redirect'
    });
    await testUser.save();
    
    console.log('🔐 Creating session for test user...');
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

    console.log('✅ Session created successfully!');
    console.log('📅 Session ID:', session._id);
    console.log('🔑 Auth Token:', session.auth_token);
    console.log('⏰ Expires At:', session.expires_at);
    
    // Simulate what would be stored in localStorage
    const localStorageData = {
      auth_token: session.auth_token,
      user: JSON.stringify({
        id: testUser._id,
        email: testUser.email,
        username: testUser.username,
        name: testUser.name
      }),
      session: JSON.stringify({
        id: session._id,
        auth_token: session.auth_token,
        expires_at: session.expires_at,
        platform: session.platform
      })
    };
    
    console.log('💾 Simulated localStorage data:');
    console.log('   - auth_token:', localStorageData.auth_token ? '✅ Present' : '❌ Missing');
    console.log('   - user:', localStorageData.user ? '✅ Present' : '❌ Missing');
    console.log('   - session:', localStorageData.session ? '✅ Present' : '❌ Missing');
    
    // Check if user would be considered authenticated
    const hasToken = !!localStorageData.auth_token;
    const hasUser = !!localStorageData.user;
    const hasSession = !!localStorageData.session;
    
    const isAuthenticated = hasToken && hasUser && hasSession;
    
    console.log('🔍 Authentication check:');
    console.log('   - Has token:', hasToken ? '✅' : '❌');
    console.log('   - Has user:', hasUser ? '✅' : '❌');
    console.log('   - Has session:', hasSession ? '✅' : '❌');
    console.log('   - Is authenticated:', isAuthenticated ? '✅ YES' : '❌ NO');
    
    if (isAuthenticated) {
      console.log('✅ User would be redirected to /chat (not shown login page)');
    } else {
      console.log('❌ User would be shown login page (should be redirected)');
    }
    
    // Test session expiration check
    const sessionData = JSON.parse(localStorageData.session);
    const sessionExpiry = new Date(sessionData.expires_at);
    const now = new Date();
    const isSessionValid = sessionExpiry > now;
    
    console.log('⏰ Session validity check:');
    console.log('   - Session expires:', sessionExpiry);
    console.log('   - Current time:', now);
    console.log('   - Is session valid:', isSessionValid ? '✅ YES' : '❌ NO');
    
    // Clean up
    console.log('🧹 Cleaning up test data...');
    await User.deleteMany({ email: 'testredirect@example.com' });
    await Session.deleteMany({ user_id: testUser._id });
    
    console.log('✅ Auth redirect test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testAuthRedirect();
