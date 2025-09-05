import axios from 'axios';

class FastAPIService {
  constructor() {
    this.baseURL = process.env.FASTAPI_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Send a chat query to FastAPI and get the response
   * @param {string} query - The user's query
   * @returns {Promise<Object>} - Response with query and answer
   */
  async sendChatQuery(query) {
    try {
      const response = await this.client.post('/chat', {
        query: query
      });
      
      return {
        success: true,
        data: response.data,
        query: response.data.query,
        answer: response.data.answer
      };
    } catch (error) {
      console.error('FastAPI chat error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Get web sources from the last chat query
   * @returns {Promise<Object>} - Response with categorized sources
   */
  async getWebSources() {
    try {
      const response = await this.client.get('/websource');
      
      return {
        success: true,
        data: response.data,
        sources: response.data.sources
      };
    } catch (error) {
      console.error('FastAPI websource error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Get related prompts from the last chat query
   * @returns {Promise<Object>} - Response with related prompts
   */
  async getRelatedPrompts() {
    try {
      const response = await this.client.get('/related');
      
      return {
        success: true,
        data: response.data,
        related_prompts: response.data.related_prompts
      };
    } catch (error) {
      console.error('FastAPI related prompts error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Get complete chat response with sources and related prompts
   * @param {string} query - The user's query
   * @returns {Promise<Object>} - Complete response with answer, sources, and related prompts
   */
  async getCompleteChatResponse(query) {
    try {
      // First, send the chat query
      const chatResponse = await this.sendChatQuery(query);
      
      if (!chatResponse.success) {
        return chatResponse;
      }

      // Then get web sources and related prompts
      const [sourcesResponse, promptsResponse] = await Promise.all([
        this.getWebSources(),
        this.getRelatedPrompts()
      ]);

      // Process sources - ensure it's always an array
      let processedSources = [];
      if (sourcesResponse.success && sourcesResponse.sources) {
        // Use the new extraction function to handle nested structure
        processedSources = this.extractWebSources(sourcesResponse.sources);
      }

      // Process related prompts - ensure it's always an array
      let processedPrompts = [];
      if (promptsResponse.success && promptsResponse.related_prompts) {
        if (Array.isArray(promptsResponse.related_prompts)) {
          processedPrompts = promptsResponse.related_prompts;
        } else if (typeof promptsResponse.related_prompts === 'object') {
          // If related_prompts is an object, try to extract array from it
          if (promptsResponse.related_prompts.related_prompts && Array.isArray(promptsResponse.related_prompts.related_prompts)) {
            processedPrompts = promptsResponse.related_prompts.related_prompts;
          } else if (promptsResponse.related_prompts.data && Array.isArray(promptsResponse.related_prompts.data)) {
            processedPrompts = promptsResponse.related_prompts.data;
          }
        }
      }

      console.log('FastAPI Debug - Sources Response:', {
        success: sourcesResponse.success,
        sources: sourcesResponse.sources,
        processedSources: processedSources
      });

      console.log('FastAPI Debug - Prompts Response:', {
        success: promptsResponse.success,
        related_prompts: promptsResponse.related_prompts,
        processedPrompts: processedPrompts
      });

      return {
        success: true,
        data: {
          query: chatResponse.query,
          answer: chatResponse.answer,
          sources: processedSources,
          related_prompts: processedPrompts
        },
        query: chatResponse.query,
        answer: chatResponse.answer,
        sources: processedSources,
        related_prompts: processedPrompts
      };
    } catch (error) {
      console.error('FastAPI complete chat error:', error);
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  /**
   * Check if FastAPI server is healthy
   * @returns {Promise<boolean>} - True if server is healthy
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('FastAPI health check failed:', error.message);
      return false;
    }
  }

  /**
   * Extract and flatten web sources from the nested API response
   * @param {Object} sourcesData - The raw sources data from API
   * @returns {Array} - Flattened array of WebSource objects
   */
  extractWebSources(sourcesData) {
    const extractedSources = [];
    
    if (!sourcesData || typeof sourcesData !== 'object') {
      return extractedSources;
    }

    // Handle the nested structure from FastAPI
    if (sourcesData.web) {
      // Iterate through each category in the web sources
      Object.entries(sourcesData.web).forEach(([category, sources]) => {
        if (Array.isArray(sources)) {
          sources.forEach(source => {
            if (source) {
              let extractedSource;
              
              // Handle case where source is a string (URL)
              if (typeof source === 'string') {
                extractedSource = {
                  title: this.extractTitleFromUrl(source),
                  url: source,
                  domain: this.extractDomain(source),
                  snippet: `Source from ${category}`,
                  category: category
                };
              }
              // Handle case where source is an object
              else if (typeof source === 'object') {
                extractedSource = {
                  title: source.title || source.name || this.extractTitleFromUrl(source.url || source.link),
                  url: source.url || source.link || '#',
                  domain: source.domain || this.extractDomain(source.url || source.link),
                  snippet: source.snippet || source.description || source.summary || `Source from ${category}`,
                  category: category
                };
              }
              
              // Only add if we have at least a title and URL
              if (extractedSource && extractedSource.title && extractedSource.url && extractedSource.url !== '#') {
                extractedSources.push(extractedSource);
              }
            }
          });
        }
      });
    }

    // Also check for knowledge_base sources if they exist
    if (sourcesData.knowledge_base && Array.isArray(sourcesData.knowledge_base)) {
      sourcesData.knowledge_base.forEach(source => {
        if (source) {
          let extractedSource;
          
          // Handle case where source is a string (URL)
          if (typeof source === 'string') {
            extractedSource = {
              title: this.extractTitleFromUrl(source),
              url: source,
              domain: this.extractDomain(source),
              snippet: 'Knowledge base source',
              category: 'Knowledge Base'
            };
          }
          // Handle case where source is an object
          else if (typeof source === 'object') {
            extractedSource = {
              title: source.title || source.name || this.extractTitleFromUrl(source.url || source.link),
              url: source.url || source.link || '#',
              domain: source.domain || this.extractDomain(source.url || source.link),
              snippet: source.snippet || source.description || source.summary || 'Knowledge base source',
              category: 'Knowledge Base'
            };
          }
          
          if (extractedSource && extractedSource.title && extractedSource.url && extractedSource.url !== '#') {
            extractedSources.push(extractedSource);
          }
        }
      });
    }

    // If sourcesData is already an array, process it directly
    if (Array.isArray(sourcesData)) {
      sourcesData.forEach(source => {
        if (source) {
          let extractedSource;
          
          // Handle case where source is a string (URL)
          if (typeof source === 'string') {
            extractedSource = {
              title: this.extractTitleFromUrl(source),
              url: source,
              domain: this.extractDomain(source),
              snippet: 'Web source',
              category: 'General'
            };
          }
          // Handle case where source is an object
          else if (typeof source === 'object') {
            extractedSource = {
              title: source.title || source.name || this.extractTitleFromUrl(source.url || source.link),
              url: source.url || source.link || '#',
              domain: source.domain || this.extractDomain(source.url || source.link),
              snippet: source.snippet || source.description || source.summary || 'Web source',
              category: source.category || 'General'
            };
          }
          
          if (extractedSource && extractedSource.title && extractedSource.url && extractedSource.url !== '#') {
            extractedSources.push(extractedSource);
          }
        }
      });
    }

    console.log('Extracted Web Sources:', {
      originalData: sourcesData,
      extractedCount: extractedSources.length,
      extractedSources: extractedSources
    });

    return extractedSources;
  }

  /**
   * Extract domain from URL
   * @param {string} url - The URL to extract domain from
   * @returns {string} - The extracted domain
   */
  extractDomain(url) {
    if (!url || url === '#') return 'unknown';
    
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      return match ? match[1] : 'unknown';
    }
  }

  /**
   * Extract title from URL
   * @param {string} url - The URL to extract title from
   * @returns {string} - The extracted title
   */
  extractTitleFromUrl(url) {
    if (!url || url === '#') return 'Untitled';
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract title from pathname
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length > 0) {
        // Convert last path part to title case
        const lastPart = pathParts[pathParts.length - 1];
        return lastPart
          .replace(/[-_]/g, ' ')
          .replace(/\.[^/.]+$/, '') // Remove file extension
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
      
      // Fallback to domain name
      return urlObj.hostname.replace('www.', '').split('.')[0];
    } catch (error) {
      // If URL parsing fails, try to extract title manually
      const match = url.match(/[^\/]+$/);
      if (match) {
        return match[0]
          .replace(/[-_]/g, ' ')
          .replace(/\.[^/.]+$/, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
      return 'Web Source';
    }
  }
}

export default new FastAPIService();
