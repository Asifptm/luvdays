import mongoose from 'mongoose';
import ChatQueries from '../models/ChatQueries.js';

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_chat_app';

async function testChatNoAuth() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(TEST_DB_URI);
    
    console.log('🧪 Testing chat functionality without authentication...');
    
    // Test creating a ChatQueries entry without user_id and session_id
    const testQuery = new ChatQueries({
      user_id: null, // Anonymous user
      session_id: null, // No session
      query: 'What is artificial intelligence?',
      response: 'Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence.',
      role: 'assistant',
      status: 'completed',
      text: 'Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence.',
      category: 'general'
    });
    
    await testQuery.save();
    console.log('✅ ChatQueries entry created successfully without authentication!');
    console.log('📝 Query ID:', testQuery._id);
    console.log('❓ Query:', testQuery.query);
    console.log('💬 Response:', testQuery.response.substring(0, 50) + '...');
    console.log('👤 User ID:', testQuery.user_id);
    console.log('🔑 Session ID:', testQuery.session_id);
    
    // Verify the entry was saved correctly
    const savedQuery = await ChatQueries.findById(testQuery._id);
    if (savedQuery) {
      console.log('✅ Query saved and retrieved successfully!');
      console.log('🔍 Verification:');
      console.log('   - User ID is null:', savedQuery.user_id === null ? '✅' : '❌');
      console.log('   - Session ID is null:', savedQuery.session_id === null ? '✅' : '❌');
      console.log('   - Query content preserved:', savedQuery.query === testQuery.query ? '✅' : '❌');
      console.log('   - Response content preserved:', savedQuery.response === testQuery.response ? '✅' : '❌');
    } else {
      console.log('❌ Failed to retrieve saved query');
    }
    
    // Test querying for anonymous queries
    const anonymousQueries = await ChatQueries.find({ user_id: null });
    console.log('📊 Total anonymous queries in database:', anonymousQueries.length);
    
    // Clean up
    console.log('🧹 Cleaning up test data...');
    await ChatQueries.deleteMany({ _id: testQuery._id });
    
    console.log('✅ Chat no-auth test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testChatNoAuth();
