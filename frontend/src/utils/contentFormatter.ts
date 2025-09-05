export interface ContentSection {
  type: 'heading' | 'subheading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'code-block' | 'quote' | 'divider';
  content: string;
  level?: number;
  items?: string[];
  language?: string;
  fileName?: string;
}

export interface FormattedContent {
  sections: ContentSection[];
  summary: string;
}

/**
 * Auto-detects and formats content from API responses
 */
export function autoFormatContent(content: string | object): FormattedContent {
  let textContent: string;

  // Handle object responses
  if (typeof content === "object" && content !== null) {
    const obj = content as Record<string, any>;
    textContent = obj.answer || obj.content || obj.message || obj.response || JSON.stringify(content);
  } else {
    textContent = String(content);
  }

  // Convert to string and clean
  const cleanText = textContent
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  const sections = parseContent(cleanText);
  
  // Create summary from first few paragraphs
  const summary = sections
    .filter(s => s.type === 'paragraph')
    .slice(0, 2)
    .map(s => s.content.replace(/<[^>]*>/g, '')) // Remove HTML tags
    .join(" ")
    .substring(0, 200) + (cleanText.length > 200 ? "..." : "");

  return { sections, summary };
}

/**
 * Parses text content into structured sections
 */
function parseContent(text: string): ContentSection[] {
  const sections: ContentSection[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentList: string[] = [];
  let currentListType: 'bullet-list' | 'numbered-list' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Code blocks with file name detection
    if (line.startsWith('```')) {
      flushCurrentList();
      const codeHeader = line.replace('```', '').trim();
      
      // Parse language and file name from header
      let language = 'text';
      let fileName = '';
      
      if (codeHeader) {
        // Check for file name pattern: language:filename or just filename
        const fileMatch = codeHeader.match(/^(\w+):(.+)$/);
        if (fileMatch) {
          language = fileMatch[1];
          fileName = fileMatch[2].trim();
        } else {
          // Check if it's just a file extension
          const extMatch = codeHeader.match(/^\.(\w+)$/);
          if (extMatch) {
            language = extMatch[1];
            fileName = `file.${extMatch[1]}`;
          } else {
            // Check if it's a common file name with extension
            const fileNameMatch = codeHeader.match(/^(.+\.\w+)$/);
            if (fileNameMatch) {
              fileName = fileNameMatch[1];
              // Extract language from file extension
              const ext = fileName.split('.').pop()?.toLowerCase();
              if (ext) {
                const langMap: Record<string, string> = {
                  'js': 'javascript',
                  'ts': 'typescript',
                  'jsx': 'jsx',
                  'tsx': 'tsx',
                  'py': 'python',
                  'java': 'java',
                  'cpp': 'cpp',
                  'c': 'c',
                  'cs': 'csharp',
                  'php': 'php',
                  'rb': 'ruby',
                  'go': 'go',
                  'rs': 'rust',
                  'swift': 'swift',
                  'kt': 'kotlin',
                  'scala': 'scala',
                  'html': 'html',
                  'css': 'css',
                  'scss': 'scss',
                  'sass': 'sass',
                  'less': 'less',
                  'json': 'json',
                  'xml': 'xml',
                  'yaml': 'yaml',
                  'yml': 'yaml',
                  'md': 'markdown',
                  'sql': 'sql',
                  'sh': 'bash',
                  'bash': 'bash',
                  'zsh': 'bash',
                  'ps1': 'powershell',
                  'dockerfile': 'dockerfile',
                  'docker': 'dockerfile'
                };
                language = langMap[ext] || ext;
              }
            } else {
              language = codeHeader;
            }
          }
        }
      }
      
      const codeLines: string[] = [];
      i++;
      
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      sections.push({
        type: 'code-block',
        content: codeLines.join('\n'),
        language,
        fileName
      });
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushCurrentList();
      const level = headingMatch[1].length;
      sections.push({
        type: level === 1 ? 'heading' : 'subheading',
        content: headingMatch[2],
        level
      });
      continue;
    }

    // Quotes
    if (line.startsWith('>')) {
      flushCurrentList();
      sections.push({
        type: 'quote',
        content: line.replace(/^>\s*/, '')
      });
      continue;
    }

    // Dividers
    if (line.match(/^[-*_]{3,}$/)) {
      flushCurrentList();
      sections.push({
        type: 'divider',
        content: ''
      });
      continue;
    }

    // Bullet lists with subheadings
    const bulletMatch = line.match(/^[\s]*[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (currentListType !== 'bullet-list') {
        flushCurrentList();
        currentListType = 'bullet-list';
      }
      
      // Check if this bullet point has a subheading pattern (e.g., "**Title**: Description")
      const subheadingMatch = bulletMatch[1].match(/^\*\*(.+?)\*\*:\s*(.+)$/);
      if (subheadingMatch) {
        const formattedItem = `<strong class="font-bold text-black">${subheadingMatch[1]}</strong><br><span class="text-gray-600">${subheadingMatch[2]}</span>`;
        currentList.push(formattedItem);
      } else {
        currentList.push(bulletMatch[1]);
      }
      continue;
    }

    // Numbered lists with subheadings
    const numberedMatch = line.match(/^[\s]*(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      if (currentListType !== 'numbered-list') {
        flushCurrentList();
        currentListType = 'numbered-list';
      }
      
      // Check if this numbered item has a subheading pattern
      const subheadingMatch = numberedMatch[2].match(/^\*\*(.+?)\*\*:\s*(.+)$/);
      if (subheadingMatch) {
        const formattedItem = `<strong class="font-bold text-black">${subheadingMatch[1]}</strong><br><span class="text-gray-600">${subheadingMatch[2]}</span>`;
        currentList.push(formattedItem);
      } else {
        currentList.push(numberedMatch[2]);
      }
      continue;
    }

    // Regular paragraphs
    flushCurrentList();
    
    // Process inline formatting with enhanced highlighting and link detection
    let processedContent = line
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>') // Italic
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>') // Inline code
      .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-500">$1</del>') // Strikethrough
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>') // Highlight
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>'); // Markdown links

    // Detect and format reference links (various patterns)
    processedContent = processedContent
      // Reference links like [1], [2], etc.
      .replace(/\[(\d+)\]/g, '<span class="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">[$1]</span>')
      // URLs starting with http/https
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
      // www links
      .replace(/(www\.[^\s]+)/g, '<a href="https://$1" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
      // Email addresses
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
      // Reference patterns like "see: url" or "source: url"
      .replace(/(see|source|reference|link|more|read|learn):\s*(https?:\/\/[^\s]+)/gi, '<span class="text-gray-600">$1:</span> <a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">$2</a>')
      // Reference patterns like "see: www.url.com"
      .replace(/(see|source|reference|link|more|read|learn):\s*(www\.[^\s]+)/gi, '<span class="text-gray-600">$1:</span> <a href="https://$2" class="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">$2</a>');

    // Highlight important words (common keywords)
    const importantWords = [
      'important', 'key', 'essential', 'critical', 'crucial', 'vital', 'significant',
      'major', 'primary', 'main', 'core', 'fundamental', 'basic', 'advanced',
      'warning', 'note', 'tip', 'example', 'solution', 'problem', 'error',
      'success', 'failure', 'best', 'worst', 'recommended', 'required', 'optional'
    ];

    importantWords.forEach(word => {
      try {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
        processedContent = processedContent.replace(regex, `<span class="font-semibold text-blue-700">${word}</span>`);
      } catch (error) {
        // Silently skip problematic words
      }
    });

    sections.push({
      type: 'paragraph',
      content: processedContent
    });
  }

  // Flush any remaining list
  flushCurrentList();

  function flushCurrentList() {
    if (currentList.length > 0 && currentListType) {
      sections.push({
        type: currentListType,
        content: currentListType === 'bullet-list' ? 'Bullet List' : 'Numbered List',
        items: [...currentList]
      });
      currentList = [];
      currentListType = null;
    }
  }

  return sections;
}
