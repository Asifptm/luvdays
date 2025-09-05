import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface RelatedPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  className?: string;
}

const RelatedPrompts: React.FC<RelatedPromptsProps> = ({ 
  prompts, 
  onPromptClick, 
  className = '' 
}) => {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Simple Header */}
      <div className="flex items-center space-x-2">
        <Lightbulb size={16} className="text-gray-600" />
        <span className="text-sm font-semibold text-gray-800">Related Questions</span>
      </div>

      {/* Tag-style Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="group inline-flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-gray-300 rounded-[23px] px-3 py-1.5 transition-all duration-200"
          >
            <span className="text-sm text-gray-700 group-hover:text-gray-800 line-clamp-1 max-w-[140px] sm:max-w-[180px]">
              {prompt}
            </span>
            <ArrowRight size={12} className="text-gray-500 group-hover:text-gray-600 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelatedPrompts;
