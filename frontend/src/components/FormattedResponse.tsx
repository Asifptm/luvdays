import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface FormattedContent {
  type: 'heading' | 'subheading' | 'paragraph' | 'list' | 'steps' | 'code';
  content: string;
  items?: string[];
  language?: string;
}

interface FormattedResponseProps {
  sections: FormattedContent[];
  className?: string;
}

const FormattedResponse: React.FC<FormattedResponseProps> = ({ sections, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Function to copy content to clipboard
  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Function to get section content as text
  const getSectionText = (section: FormattedContent): string => {
    switch (section.type) {
      case 'list':
        return section.items?.map((item: string) => `• ${item}`).join('\n') || '';
      case 'steps':
        return section.items?.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n') || '';
      case 'code':
        return section.content;
      default:
        return section.content;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {sections.map((section, index) => {
        const sectionText = getSectionText(section);
        const isHeading = section.type === 'heading' || section.type === 'subheading';

        return (
          <div 
            key={index} 
            className={`w-full group relative ${
              isHeading ? 'mb-3' : 'mb-2'
            }`}
          >
            {/* Copy Button - Only for non-heading sections */}
            {!isHeading && (
              <button
                onClick={() => copyToClipboard(sectionText, index)}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md z-10"
                title="Copy content"
              >
                {copiedIndex === index ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500" />
                )}
              </button>
            )}

            {/* Section Content */}
            <div className={`
              ${isHeading ? 'border-b border-gray-200 pb-2' : ''}
              ${section.type === 'code' ? 'bg-gray-50 p-4 rounded-lg border border-gray-200' : ''}
              ${section.type === 'list' || section.type === 'steps' ? 'pl-4' : ''}
            `}>
              {section.type === 'heading' ? (
                <h2 className="text-xl font-bold text-gray-900">{section.content}</h2>
              ) : section.type === 'subheading' ? (
                <h3 className="text-lg font-semibold text-gray-800">{section.content}</h3>
              ) : section.type === 'list' ? (
                <ul className="list-disc space-y-1">
                  {section.items?.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              ) : section.type === 'steps' ? (
                <ol className="list-decimal space-y-1">
                  {section.items?.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="text-gray-700">{item}</li>
                  ))}
                </ol>
              ) : section.type === 'code' ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{section.content}</pre>
              ) : (
                <p className="text-gray-700">{section.content}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FormattedResponse;
