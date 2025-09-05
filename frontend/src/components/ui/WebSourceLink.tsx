import React from 'react';
import { Copy, ExternalLink, Newspaper, GraduationCap, MessageCircle, ShoppingCart, Code, BookOpen, Building, Heart, DollarSign, Play, Globe } from 'lucide-react';
import { getPrimaryCategory } from '../../utils/sourceCategorizer';

// Function to get the appropriate Lucide icon component
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Newspaper,
    GraduationCap,
    MessageCircle,
    ShoppingCart,
    Code,
    BookOpen,
    Building,
    Heart,
    DollarSign,
    Play,
    Globe,
  };
  
  return iconMap[iconName] || Globe;
};

interface WebSource {
  url: string;
  title: string;
  snippet: string;
  domain: string;
}

interface WebSourceLinkProps {
  source: WebSource;
  sourceIndex: number;
  onCopyUrl: (url: string) => void;
}

const WebSourceLink: React.FC<WebSourceLinkProps> = ({ source, onCopyUrl }) => {
  const category = getPrimaryCategory(source.url, source.title, source.snippet);

  return (
    <div
      className="border border-blue-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${category.color}`}
            >
              {React.createElement(getIconComponent(category.icon), { size: 12, className: "sm:w-[14px] sm:h-[14px]" })}
              {category.tag}
            </span>
          </div>
          <h4 className="font-medium text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base truncate">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center space-x-1"
            >
              <span className="truncate">{source.title}</span>
              <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
            </a>
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{source.domain}</p>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">{source.snippet}</p>
        </div>
        <button
          onClick={() => onCopyUrl(source.url)}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
          title="Copy URL"
        >
          <Copy size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

export default WebSourceLink;
