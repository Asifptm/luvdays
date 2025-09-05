import React from 'react';
import { autoFormatContent } from '../utils/contentFormatter';

interface AutoFormatContentProps {
  content: string | object;
  className?: string;
}

// Syntax highlighting function
function highlightSyntax(code: string, language: string): string {
  // Basic syntax highlighting patterns
  const patterns = {
    javascript: {
      keywords: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|try|catch|finally)\b/g,
      strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      numbers: /\b\d+(?:\.\d+)?\b/g,
      functions: /\b\w+(?=\s*\()/g
    },
    typescript: {
      keywords: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|try|catch|finally|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|extends|implements)\b/g,
      strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      numbers: /\b\d+(?:\.\d+)?\b/g,
      functions: /\b\w+(?=\s*\()/g,
      types: /\b(string|number|boolean|any|void|undefined|null|object|array|Promise|Date|RegExp)\b/g
    },
    python: {
      keywords: /\b(def|class|import|from|as|if|elif|else|for|while|try|except|finally|with|return|yield|lambda|True|False|None|and|or|not|in|is|del|global|nonlocal|pass|break|continue|raise)\b/g,
      strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      comments: /(#.*$)/gm,
      numbers: /\b\d+(?:\.\d+)?\b/g,
      functions: /\b\w+(?=\s*\()/g
    },
    html: {
      tags: /<\/?[^>]+>/g,
      attributes: /\s\w+(?=\s*[=>])/g,
      strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      comments: /<!--[\s\S]*?-->/g
    },
    css: {
      properties: /\b\w+(?=\s*:)/g,
      values: /:\s*[^;]+/g,
      selectors: /[.#]?\w+/g,
      comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      numbers: /\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|deg|rad|turn)\b/g
    },
    json: {
      keys: /"([^"]+)":/g,
      strings: /"([^"]*)"/g,
      numbers: /\b\d+(?:\.\d+)?\b/g,
      booleans: /\b(true|false|null)\b/g
    },
    sql: {
      keywords: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|PRIMARY|FOREIGN|KEY|REFERENCES|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|AS|ON|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|DISTINCT|COUNT|SUM|AVG|MAX|MIN)\b/gi,
      strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      numbers: /\b\d+(?:\.\d+)?\b/g,
      comments: /(--.*$|\/\*[\s\S]*?\*\/)/gm
    }
  };

  let highlightedCode = code;

  // Escape HTML characters
  highlightedCode = highlightedCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const langPatterns = patterns[language as keyof typeof patterns];
  if (langPatterns) {
    // Apply syntax highlighting patterns
    Object.entries(langPatterns).forEach(([type, pattern]) => {
      highlightedCode = highlightedCode.replace(pattern, (match) => {
        const className = `syntax-${type}`;
        return `<span class="${className}">${match}</span>`;
      });
    });
  }

  return highlightedCode;
}

const AutoFormatContent: React.FC<AutoFormatContentProps> = ({
  content,
  className = ''
}) => {
  const formattedContent = autoFormatContent(content);

  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      {formattedContent.sections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="mb-6 last:mb-0">
          {section.type === 'heading' && (
            <h1 className="text-3xl font-bold text-black mb-6 leading-tight border-b border-gray-200 pb-3">
              {section.content}
            </h1>
          )}
          
          {section.type === 'subheading' && (
            <h2 className="text-2xl font-bold text-black mb-4 leading-tight">
              {section.content}
            </h2>
          )}
          
          {section.type === 'paragraph' && (
            <p 
              className="text-gray-700 leading-7 mb-6 text-base"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          )}
          
          {section.type === 'bullet-list' && section.items && (
            <ul className="space-y-2 mb-6 list-none">
              {section.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`} className="flex items-start">
                  <span className="text-gray-500 mr-2 mt-2 text-lg flex-shrink-0">•</span>
                  <div 
                    className="text-gray-700 leading-7 text-base flex-1"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                </li>
              ))}
            </ul>
          )}
          
          {section.type === 'numbered-list' && section.items && (
            <ol className="space-y-2 mb-6 list-none">
              {section.items.map((item, itemIndex) => (
                <li key={`numbered-item-${itemIndex}`} className="flex items-start">
                  <span className="text-gray-700 mr-2 mt-1 text-base font-semibold min-w-[1.5rem] flex-shrink-0">
                    {itemIndex + 1}.
                  </span>
                  <div 
                    className="text-gray-700 leading-7 text-base flex-1"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                </li>
              ))}
            </ol>
          )}
          
          {section.type === 'code-block' && (
            <div className="mb-6">
              {/* File name header */}
              {section.fileName && (
                <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg font-mono text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    {section.fileName}
                  </span>
                  {section.language && section.language !== 'text' && (
                    <span className="text-gray-300 text-xs bg-gray-700 px-2 py-1 rounded">
                      {section.language}
                    </span>
                  )}
                </div>
              )}
              
              {/* Code block with syntax highlighting */}
              <pre className={`text-sm font-mono overflow-x-auto border border-gray-200 shadow-sm ${
                section.fileName 
                  ? 'bg-gray-900 text-gray-100 rounded-b-lg p-5' 
                  : 'bg-gray-50 text-gray-800 rounded-lg p-5'
              }`}>
                <code 
                  className="syntax-highlighted"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSyntax(section.content, section.language || 'text') 
                  }}
                />
              </pre>
            </div>
          )}

          {section.type === 'quote' && (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-6 bg-gray-50 py-3 rounded-r-lg">
              {section.content}
            </blockquote>
          )}

          {section.type === 'divider' && (
            <hr className="border-gray-200 my-8" />
          )}
        </div>
      ))}
    </div>
  );
};

export default AutoFormatContent;
