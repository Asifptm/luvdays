import mongoose from 'mongoose';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { createSession } from '../middleware/auth.js';

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_chat_app';

async function testSessionCreation() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(TEST_DB_URI);
    
    console.log('👤 Creating test user...');
    const testUser = new User({
      email: 'test23days@example.com',
      username: 'testuser23days',
      name: 'Test User 23 Days'
    });
    await testUser.save();
    
    console.log('🔐 Creating session with 23 days expiration...');
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
    
    // Calculate days until expiration
    const now = new Date();
    const daysUntilExpiry = Math.ceil((session.expires_at - now) / (1000 * 60 * 60 * 24));
    console.log('📊 Days until expiration:', daysUntilExpiry);
    
    // Verify it's approximately 23 days
    if (daysUntilExpiry >= 22 && daysUntilExpiry <= 24) {
      console.log('✅ Session expiration is correctly set to ~23 days!');
    } else {
      console.log('❌ Session expiration is not 23 days:', daysUntilExpiry, 'days');
    }
    
    // Clean up
    console.log('🧹 Cleaning up test data...');
    await User.deleteMany({ email: 'test23days@example.com' });
    await Session.deleteMany({ user_id: testUser._id });
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testSessionCreation();
