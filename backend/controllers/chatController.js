import Chat from '../models/Chat.js';
import ChatHistory from '../models/ChatHistory.js';
import ChatQueries from '../models/ChatQueries.js';
import User from '../models/User.js';
import fastAPIService from '../services/fastapiService.js';

// Check if user exists before chat operations (optional auth)
const checkUserExists = async (userId) => {
  if (!userId) {
    return null; // No user provided, but that's okay for optional auth
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user exists
    await checkUserExists(userId);

    const { page = 1, limit = 10, chatType } = req.query;
    const skip = (page - 1) * limit;

    let query = { participants: userId };
    if (chatType) {
      query.chatType = chatType;
    }

    const chats = await Chat.find(query)
      .populate('participants', 'name email')
      .populate('lastMessage.sender', 'name')
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Chat.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        chats: chats.map(chat => ({
          id: chat._id,
          chatType: chat.chatType,
          chatName: chat.chatName,
          participants: chat.participants,
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount,
          created_at: chat.created_at,
          updated_at: chat.updated_at
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
    console.error('Get user chats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user exists
    await checkUserExists(userId);

    // Check if user is participant in the chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found or access denied'
      });
    }

    const messages = await Chat.findById(chatId)
      .select('messages')
      .slice('messages', [skip, parseInt(limit)])
      .sort({ 'messages.created_at': -1 });

    if (!messages) {
      return res.status(404).json({
        status: 'error',
        message: 'Messages not found'
      });
    }

    // Mark messages as read
    await Chat.updateMany(
      { 
        _id: chatId, 
        'messages.sender': { $ne: userId },
        'messages.isRead': false 
      },
      { $set: { 'messages.$.isRead': true } }
    );

    res.status(200).json({
      status: 'success',
      data: {
        messages: messages.messages || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: chat.messages?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Send message to chat
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { content, messageType = 'text', attachments = [] } = req.body;

    // Check if user exists
    await checkUserExists(userId);

    // Check if user is participant in the chat
    const chat = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found or access denied'
      });
    }

    // Create message object
    const message = {
      sender: userId,
      content,
      messageType,
      attachments,
      created_at: new Date(),
      isRead: false
    };

    // Add message to chat
    chat.messages.push(message);
    chat.lastMessage = message;
    chat.updated_at = new Date();
    await chat.save();

    // Populate sender info for response
    const populatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'name email')
      .populate('lastMessage.sender', 'name');

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: {
        message: {
          id: newMessage._id,
          sender: newMessage.sender,
          content: newMessage.content,
          messageType: newMessage.messageType,
          attachments: newMessage.attachments,
          created_at: newMessage.created_at,
          isRead: newMessage.isRead
        }
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// AI Chat Query
export const aiChatQuery = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user ID
    const { content, saveToHistory = true } = req.body;

    // Check if user exists (optional)
    await checkUserExists(userId);

    if (!content || content.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Query content is required'
      });
    }

    // Send query to FastAPI and get complete response with sources and related prompts
    const aiResponse = await fastAPIService.getCompleteChatResponse(content);

    if (!aiResponse.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get AI response',
        error: aiResponse.error
      });
    }

    // Debug logging
    console.log('AI Response Debug:', {
      query: aiResponse.query,
      answer: aiResponse.answer,
      sources: aiResponse.sources,
      related_prompts: aiResponse.related_prompts,
      sourcesType: typeof aiResponse.sources,
      sourcesIsArray: Array.isArray(aiResponse.sources)
    });

    // Save to ChatHistory if requested and user is authenticated
    let chatHistoryEntry = null;
    if (saveToHistory && userId) {
      chatHistoryEntry = new ChatHistory({
        user_id: userId,
        query: content,
        response: aiResponse.answer,
        role: 'assistant',
        status: 'completed',
        text: aiResponse.answer,
        attachments: []
      });
      await chatHistoryEntry.save();
    }

    // Save to ChatQueries (always save, even without user)
    const chatQuery = new ChatQueries({
      user_id: userId || null, // Can be null for anonymous users
      session_id: req.session?._id || null, // Can be null for anonymous users
      query: content,
      response: aiResponse.answer,
      role: 'assistant',
      status: 'completed',
      text: aiResponse.answer,
      chat_history_id: chatHistoryEntry?._id
    });
    await chatQuery.save();

    res.status(200).json({
      status: 'success',
      message: 'AI query processed successfully',
      data: {
        query: aiResponse.query,
        answer: aiResponse.answer,
        sources: aiResponse.sources || {},
        related_prompts: aiResponse.related_prompts || [],
        chatHistoryId: chatHistoryEntry?._id,
        chatQueryId: chatQuery._id,
        isAuthenticated: !!userId
      }
    });
  } catch (error) {
    console.error('AI chat query error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get AI Web Sources
export const getAIWebSources = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user ID

    // Check if user exists (optional)
    await checkUserExists(userId);

    const sourcesResponse = await fastAPIService.getWebSources();

    if (!sourcesResponse.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get web sources',
        error: sourcesResponse.error
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Web sources retrieved successfully',
      data: {
        sources: sourcesResponse.sources,
        isAuthenticated: !!userId
      }
    });
  } catch (error) {
    console.error('Get AI web sources error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get AI Related Prompts
export const getAIRelatedPrompts = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user ID

    // Check if user exists (optional)
    await checkUserExists(userId);

    const promptsResponse = await fastAPIService.getRelatedPrompts();

    if (!promptsResponse.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get related prompts',
        error: promptsResponse.error
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Related prompts retrieved successfully',
      data: {
        related_prompts: promptsResponse.related_prompts,
        isAuthenticated: !!userId
      }
    });
  } catch (error) {
    console.error('Get AI related prompts error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Create AI Chat Room
export const createAIChat = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user ID
    const { chatName = 'AI Assistant' } = req.body;

    // Check if user exists (optional)
    await checkUserExists(userId);

    // Only check for existing AI chat if user is authenticated
    if (userId) {
      // Check if user already has an AI chat
      const existingAIChat = await Chat.findOne({
        participants: userId,
        chatType: 'ai'
      });

      if (existingAIChat) {
        return res.status(400).json({
          status: 'error',
          message: 'User already has an AI chat room'
        });
      }
    }

    // Create new AI chat (with or without user)
    const aiChat = new Chat({
      chatType: 'ai',
      chatName,
      participants: userId ? [userId] : [], // Empty array if no user
      messages: [],
      unreadCount: 0
    });

    await aiChat.save();

    res.status(201).json({
      status: 'success',
      message: 'AI chat room created successfully',
      data: {
        chat: {
          id: aiChat._id,
          chatType: aiChat.chatType,
          chatName: aiChat.chatName,
          participants: aiChat.participants,
          created_at: aiChat.created_at,
          updated_at: aiChat.updated_at
        },
        isAuthenticated: !!userId
      }
    });
  } catch (error) {
    console.error('Create AI chat error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Get Chat History
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user ID
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user exists (optional)
    await checkUserExists(userId);

    // If no user, return empty results
    if (!userId) {
      return res.status(200).json({
        status: 'success',
        message: 'No chat history available for unauthenticated users',
        data: {
          chatHistory: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          },
          isAuthenticated: false
        }
      });
    }

    const chatHistory = await ChatHistory.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await ChatHistory.countDocuments({ user_id: userId });

    res.status(200).json({
      status: 'success',
      message: 'Chat history retrieved successfully',
      data: {
        chatHistory: chatHistory.map(entry => ({
          id: entry._id,
          query: entry.query,
          response: entry.response,
          role: entry.role,
          status: entry.status,
          created_at: entry.created_at,
          updated_at: entry.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        isAuthenticated: true
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};
