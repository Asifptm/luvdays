export interface SourceCategory {
  category: string;
  tag: string;
  color: string;
  icon: string;
}

// Domain patterns for categorization
const domainPatterns = {
  news: [
    'news', 'bbc', 'cnn', 'reuters', 'ap', 'npr', 'nytimes', 'washingtonpost',
    'theguardian', 'wsj', 'bloomberg', 'techcrunch', 'ars-technica', 'wired',
    'verge', 'engadget', 'mashable', 'gizmodo', 'cnet', 'zdnet'
  ],
  academic: [
    'edu', 'academia', 'researchgate', 'arxiv', 'scholar', 'jstor', 'sciencedirect',
    'springer', 'wiley', 'nature', 'science', 'cell', 'pubmed', 'ncbi'
  ],
  social: [
    'twitter', 'facebook', 'instagram', 'linkedin', 'reddit', 'youtube', 'tiktok',
    'discord', 'telegram', 'whatsapp', 'snapchat', 'pinterest'
  ],
  ecommerce: [
    'amazon', 'ebay', 'etsy', 'shopify', 'walmart', 'target', 'bestbuy',
    'newegg', 'aliexpress', 'alibaba', 'shop', 'store', 'buy'
  ],
  tech: [
    'github', 'stackoverflow', 'gitlab', 'bitbucket', 'npm', 'pypi', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify',
    'digitalocean', 'linode', 'vultr', 'cloudflare'
  ],
  documentation: [
    'docs', 'documentation', 'readme', 'wiki', 'manual', 'guide', 'tutorial',
    'api', 'reference', 'developer', 'dev'
  ],
  government: [
    'gov', 'government', 'whitehouse', 'congress', 'senate', 'house',
    'fbi', 'cia', 'nsa', 'irs', 'usps', 'dot', 'epa'
  ],
  health: [
    'health', 'medical', 'hospital', 'clinic', 'pharmacy', 'drugs', 'medicine',
    'mayoclinic', 'webmd', 'healthline', 'medline', 'who', 'cdc'
  ],
  finance: [
    'bank', 'finance', 'financial', 'money', 'investment', 'stock', 'trading',
    'market', 'economy', 'economic', 'federalreserve', 'sec', 'nasdaq', 'nyse'
  ],
  entertainment: [
    'movie', 'film', 'tv', 'television', 'show', 'series', 'netflix', 'hulu',
    'disney', 'hbo', 'amazon-prime', 'spotify', 'apple-music', 'pandora'
  ]
};

// Content keywords for categorization
const contentKeywords = {
  news: ['breaking', 'latest', 'update', 'announcement', 'report', 'coverage'],
  academic: ['study', 'research', 'paper', 'analysis', 'findings', 'methodology'],
  tech: ['technology', 'software', 'programming', 'code', 'development', 'app'],
  health: ['health', 'medical', 'treatment', 'diagnosis', 'symptoms', 'disease'],
  finance: ['financial', 'investment', 'market', 'economy', 'business', 'money'],
  entertainment: ['entertainment', 'movie', 'music', 'game', 'show', 'celebrity']
};

export function categorizeSource(url: string, title: string = '', snippet: string = ''): SourceCategory {
  const domain = extractDomain(url).toLowerCase();
  const fullText = `${title} ${snippet}`.toLowerCase();

  // Check domain patterns first
  for (const [category, patterns] of Object.entries(domainPatterns)) {
    if (patterns.some(pattern => domain.includes(pattern))) {
      return getCategoryInfo(category);
    }
  }

  // Check content keywords
  for (const [category, keywords] of Object.entries(contentKeywords)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      return getCategoryInfo(category);
    }
  }

  // Default category
  return getCategoryInfo('general');
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    // Fallback for invalid URLs
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

function getCategoryInfo(category: string): SourceCategory {
  const categoryMap: Record<string, SourceCategory> = {
    news: {
      category: 'News',
      tag: 'News',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'Newspaper'
    },
    academic: {
      category: 'Academic',
      tag: 'Academic',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'GraduationCap'
    },
    social: {
      category: 'Social Media',
      tag: 'Social',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'MessageCircle'
    },
    ecommerce: {
      category: 'E-commerce',
      tag: 'Shop',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'ShoppingCart'
    },
    tech: {
      category: 'Technology',
      tag: 'Tech',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'Code'
    },
    documentation: {
      category: 'Documentation',
      tag: 'Docs',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'BookOpen'
    },
    government: {
      category: 'Government',
      tag: 'Gov',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'Building'
    },
    health: {
      category: 'Health',
      tag: 'Health',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'Heart'
    },
    finance: {
      category: 'Finance',
      tag: 'Finance',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'DollarSign'
    },
    entertainment: {
      category: 'Entertainment',
      tag: 'Entertainment',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'Play'
    },
    general: {
      category: 'General',
      tag: 'Web',
      color: 'bg-gray-100 text-gray-700 border-blue-200',
      icon: 'Globe'
    }
  };

  return categoryMap[category] || categoryMap.general;
}

// Function to get multiple categories for a source (if it fits multiple)
export function getSourceCategories(url: string, title: string = '', snippet: string = ''): SourceCategory[] {
  const domain = extractDomain(url).toLowerCase();
  const fullText = `${title} ${snippet}`.toLowerCase();
  const categories: Set<string> = new Set();

  // Check domain patterns
  for (const [category, patterns] of Object.entries(domainPatterns)) {
    if (patterns.some(pattern => domain.includes(pattern))) {
      categories.add(category);
    }
  }

  // Check content keywords
  for (const [category, keywords] of Object.entries(contentKeywords)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      categories.add(category);
    }
  }

  // If no categories found, add general
  if (categories.size === 0) {
    categories.add('general');
  }

  return Array.from(categories).map(cat => getCategoryInfo(cat));
}

// Function to get the primary category (most specific)
export function getPrimaryCategory(url: string, title: string = '', snippet: string = ''): SourceCategory {
  const categories = getSourceCategories(url, title, snippet);
  
  // Priority order for categories
  const priority = ['academic', 'government', 'health', 'finance', 'tech', 'news', 'documentation', 'entertainment', 'social', 'ecommerce', 'general'];
  
  for (const priorityCat of priority) {
    const found = categories.find(cat => cat.category.toLowerCase() === priorityCat);
    if (found) {
      return found;
    }
  }
  
  return categories[0] || getCategoryInfo('general');
}
