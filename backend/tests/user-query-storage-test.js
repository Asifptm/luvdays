import mongoose from 'mongoose';
import ChatQueries from '../models/ChatQueries.js';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import { createSession } from '../middleware/auth.js';

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_chat_app';

async function testUserQueryStorage() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(TEST_DB_URI);
    
    console.log('👤 Creating test user...');
    const testUser = new User({
      email: 'testuserstorage@example.com',
      username: 'testuserstorage',
      name: 'Test User Storage'
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
    console.log('👤 User ID:', testUser._id);
    
    // Test 1: Store query with authenticated user
    console.log('\n🧪 Test 1: Storing query with authenticated user...');
    const authenticatedQuery = new ChatQueries({
      user_id: testUser._id, // Authenticated user ID
      session_id: session._id, // Session ID
      query: 'What is machine learning?',
      response: 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.',
      role: 'assistant',
      status: 'completed',
      text: 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.',
      category: 'ai'
    });
    
    await authenticatedQuery.save();
    console.log('✅ Authenticated query saved successfully!');
    console.log('📝 Query ID:', authenticatedQuery._id);
    console.log('👤 User ID:', authenticatedQuery.user_id);
    console.log('🔑 Session ID:', authenticatedQuery.session_id);
    
    // Test 2: Store query in ChatHistory for authenticated user
    console.log('\n🧪 Test 2: Storing query in ChatHistory for authenticated user...');
    const chatHistoryEntry = new ChatHistory({
      user_id: testUser._id, // Authenticated user ID
      session_id: session._id, // Session ID
      query: 'What is deep learning?',
      response: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data.',
      role: 'assistant',
      status: 'completed',
      text: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data.',
      attachments: []
    });
    
    await chatHistoryEntry.save();
    console.log('✅ ChatHistory entry saved successfully!');
    console.log('📝 History ID:', chatHistoryEntry._id);
    console.log('👤 User ID:', chatHistoryEntry.user_id);
    
    // Test 3: Store query without authentication (anonymous)
    console.log('\n🧪 Test 3: Storing query without authentication (anonymous)...');
    const anonymousQuery = new ChatQueries({
      user_id: null, // Anonymous user
      session_id: null, // No session
      query: 'What is artificial intelligence?',
      response: 'Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence.',
      role: 'assistant',
      status: 'completed',
      text: 'Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence.',
      category: 'general'
    });
    
    await anonymousQuery.save();
    console.log('✅ Anonymous query saved successfully!');
    console.log('📝 Query ID:', anonymousQuery._id);
    console.log('👤 User ID:', anonymousQuery.user_id);
    console.log('🔑 Session ID:', anonymousQuery.session_id);
    
    // Verification
    console.log('\n🔍 Verification:');
    
    // Check authenticated queries
    const userQueries = await ChatQueries.find({ user_id: testUser._id });
    console.log('📊 Total queries for authenticated user:', userQueries.length);
    
    // Check anonymous queries
    const anonymousQueries = await ChatQueries.find({ user_id: null });
    console.log('📊 Total anonymous queries:', anonymousQueries.length);
    
    // Check ChatHistory entries
    const userHistory = await ChatHistory.find({ user_id: testUser._id });
    console.log('📊 Total ChatHistory entries for user:', userHistory.length);
    
    // Verify data integrity
    console.log('\n✅ Data Integrity Check:');
    console.log('   - Authenticated query has user_id:', userQueries[0]?.user_id ? '✅' : '❌');
    console.log('   - Authenticated query has session_id:', userQueries[0]?.session_id ? '✅' : '❌');
    console.log('   - Anonymous query has null user_id:', anonymousQueries[0]?.user_id === null ? '✅' : '❌');
    console.log('   - Anonymous query has null session_id:', anonymousQueries[0]?.session_id === null ? '✅' : '❌');
    console.log('   - ChatHistory entry has user_id:', userHistory[0]?.user_id ? '✅' : '❌');
    
    // Test querying by user ID
    console.log('\n🔍 Testing queries by user ID:');
    const userSpecificQueries = await ChatQueries.find({ user_id: testUser._id }).sort({ created_at: -1 });
    console.log('📝 User queries:');
    userSpecificQueries.forEach((query, index) => {
      console.log(`   ${index + 1}. "${query.query}" - ${query.response.substring(0, 50)}...`);
    });
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteMany({ email: 'testuserstorage@example.com' });
    await ChatQueries.deleteMany({ _id: { $in: [authenticatedQuery._id, anonymousQuery._id] } });
    await ChatHistory.deleteMany({ _id: chatHistoryEntry._id });
    
    console.log('✅ User query storage test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testUserQueryStorage();
