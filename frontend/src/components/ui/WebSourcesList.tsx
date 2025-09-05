import React from 'react';
import { Search } from 'lucide-react';
import WebSourceLink from './WebSourceLink';

interface WebSource {
  url: string;
  title: string;
  snippet: string;
  domain: string;
}

interface WebSourcesListProps {
  sources: WebSource[];
  onCopyUrl: (url: string) => void;
}

const WebSourcesList: React.FC<WebSourcesListProps> = ({ sources, onCopyUrl }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="bg-red-100 p-2 rounded text-xs text-red-800 mb-2">
          Debug: No sources found
        </div>
        <Search size={24} className="mx-auto mb-2 text-gray-400" />
        <p>No web sources available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-yellow-100 p-2 rounded text-xs text-yellow-800 mb-2">
        Debug: Found {sources.length} sources
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center space-x-2">
        <Search size={18} className="sm:w-5 sm:h-5 text-gray-600" />
        <span>Web Sources ({sources.length})</span>
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {sources.map((source, sourceIndex) => (
          <WebSourceLink
            key={sourceIndex}
            source={source}
            sourceIndex={sourceIndex}
            onCopyUrl={onCopyUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default WebSourcesList;
