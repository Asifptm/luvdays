import axios from 'axios';
import AuthService from './authService';
import config from '../config/environment';

const API_BASE_URL = config.api.baseUrl;

export interface ChatResponse {
  success: boolean;
  query?: string;
  answer?: string;
  sources?: WebSource[];
  related_prompts?: string[];
  error?: string;
  status?: number;
}

export interface WebSource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  category: string;
}

export interface ChatHistoryEntry {
  id: string;
  query: string;
  response: string;
  text: string;
  role: 'user' | 'assistant' | 'system';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  attachments: any[];
  metadata: any;
  ai_model?: string;
  tokens_used?: number;
  processing_time?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  data?: {
    chatHistory: ChatHistoryEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
  status?: number;
}

class ApiService {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  async sendChatQuery(query: string): Promise<ChatResponse> {
    try {
      const token = AuthService.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await this.client.post('/api/chat/ai/query', {
        content: query,
        saveToHistory: true
      }, { headers });
      
      // Extract and structure the response data
      const responseData = response.data.data || response.data;
      
      return {
        success: true,
        query: responseData.query || query,
        answer: responseData.answer || responseData.response || responseData.content || '',
        sources: responseData.sources || [],
        related_prompts: responseData.related_prompts || responseData.suggestions || []
      };
    } catch (error: any) {
      console.error('Chat API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async getWebSources(): Promise<ChatResponse> {
    try {
      const response = await this.client.get('/api/chat/ai/sources');
      
      return {
        success: true,
        sources: response.data.data.sources || []
      };
    } catch (error: any) {
      console.error('Web sources API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async getRelatedPrompts(): Promise<ChatResponse> {
    try {
      const response = await this.client.get('/api/chat/ai/related');
      
      return {
        success: true,
        related_prompts: response.data.data.related_prompts || []
      };
    } catch (error: any) {
      console.error('Related prompts API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  // Chat History Methods
  async getChatHistory(page: number = 1, limit: number = 50): Promise<ChatHistoryResponse> {
    try {
      const token = AuthService.getAuthToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
          status: 401
        };
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await this.client.get(`/api/chat-history?page=${page}&limit=${limit}`, { headers });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get chat history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async createChatHistoryEntry(entry: {
    query: string;
    response: string;
    text: string;
    role: 'user' | 'assistant' | 'system';
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    attachments?: any[];
    metadata?: any;
    ai_model?: string;
    tokens_used?: number;
    processing_time?: number;
    error_message?: string;
  }): Promise<ChatHistoryResponse> {
    try {
      const token = AuthService.getAuthToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
          status: 401
        };
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await this.client.post('/api/chat-history', entry, { headers });
      
      return {
        success: true,
        data: {
          chatHistory: [response.data.data.chatHistory],
          pagination: { page: 1, limit: 1, total: 1, pages: 1 }
        }
      };
    } catch (error: any) {
      console.error('Create chat history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async searchChatHistory(searchTerm: string, page: number = 1, limit: number = 50): Promise<ChatHistoryResponse> {
    try {
      const token = AuthService.getAuthToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
          status: 401
        };
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await this.client.get(`/api/chat-history/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`, { headers });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Search chat history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async deleteChatHistoryEntry(entryId: string): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      const token = AuthService.getAuthToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
          status: 401
        };
      }

      const headers = { Authorization: `Bearer ${token}` };
      await this.client.delete(`/api/chat-history/${entryId}`, { headers });
      
      return { success: true };
    } catch (error: any) {
      console.error('Delete chat history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async submitFeedback(messageId: string, feedback: 'positive' | 'negative', comment?: string): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      const token = AuthService.getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await this.client.post('/api/chat/feedback', {
        messageId,
        feedback,
        comment
      }, { headers });
      
      return { success: true };
    } catch (error: any) {
      console.error('Submit feedback error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }


}

const apiService = new ApiService();
export default apiService;
