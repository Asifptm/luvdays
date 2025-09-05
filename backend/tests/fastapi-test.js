import axios from 'axios';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Mock the extraction function for testing
function extractWebSources(sourcesData) {
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
                title: extractTitleFromUrl(source),
                url: source,
                domain: extractDomain(source),
                snippet: `Source from ${category}`,
                category: category
              };
            }
            // Handle case where source is an object
            else if (typeof source === 'object') {
              extractedSource = {
                title: source.title || source.name || extractTitleFromUrl(source.url || source.link),
                url: source.url || source.link || '#',
                domain: source.domain || extractDomain(source.url || source.link),
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
            title: extractTitleFromUrl(source),
            url: source,
            domain: extractDomain(source),
            snippet: 'Knowledge base source',
            category: 'Knowledge Base'
          };
        }
        // Handle case where source is an object
        else if (typeof source === 'object') {
          extractedSource = {
            title: source.title || source.name || extractTitleFromUrl(source.url || source.link),
            url: source.url || source.link || '#',
            domain: source.domain || extractDomain(source.url || source.link),
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

  return extractedSources;
}

function extractDomain(url) {
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

function extractTitleFromUrl(url) {
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

async function testFastAPI() {
  try {
    console.log('Testing FastAPI endpoints...');
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get(`${FASTAPI_URL}/health`);
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test chat endpoint
    try {
      const chatResponse = await axios.post(`${FASTAPI_URL}/chat`, {
        query: "What is artificial intelligence?"
      });
      console.log('✅ Chat response:', {
        query: chatResponse.data.query,
        answer: chatResponse.data.answer,
        hasAnswer: !!chatResponse.data.answer
      });
    } catch (error) {
      console.log('❌ Chat endpoint failed:', error.message);
    }

    // Test websource endpoint
    try {
      const sourcesResponse = await axios.get(`${FASTAPI_URL}/websource`);
      console.log('✅ Web sources response:', {
        hasData: !!sourcesResponse.data,
        dataType: typeof sourcesResponse.data,
        sources: sourcesResponse.data.sources,
        sourcesType: typeof sourcesResponse.data.sources,
        isArray: Array.isArray(sourcesResponse.data.sources)
      });

      // Show detailed structure of sources
      if (sourcesResponse.data.sources && sourcesResponse.data.sources.web) {
        console.log('📊 Detailed sources structure:');
        Object.entries(sourcesResponse.data.sources.web).forEach(([category, sources]) => {
          console.log(`  ${category}: ${sources.length} sources`);
          if (sources.length > 0) {
            console.log(`    Sample:`, sources[0]);
          }
        });
      }

      // Test the extraction function
      const extractedSources = extractWebSources(sourcesResponse.data.sources);
      console.log('✅ Extracted sources:', {
        count: extractedSources.length,
        sources: extractedSources
      });
    } catch (error) {
      console.log('❌ Web sources endpoint failed:', error.message);
    }

    // Test related endpoint
    try {
      const relatedResponse = await axios.get(`${FASTAPI_URL}/related`);
      console.log('✅ Related prompts response:', {
        hasData: !!relatedResponse.data,
        dataType: typeof relatedResponse.data,
        related_prompts: relatedResponse.data.related_prompts,
        promptsType: typeof relatedResponse.data.related_prompts,
        isArray: Array.isArray(relatedResponse.data.related_prompts)
      });
    } catch (error) {
      console.log('❌ Related prompts endpoint failed:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFastAPI();
