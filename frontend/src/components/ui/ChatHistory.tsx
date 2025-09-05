import React, { useState, useEffect } from 'react';
import { Search, Clock, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService, { ChatHistoryEntry } from '../../services/api';

interface ChatHistoryProps {
  onSelectHistory: (entry: ChatHistoryEntry) => void;
  onClose: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onSelectHistory, onClose }) => {
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async (page: number = 1, search: string = '') => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (search.trim()) {
        response = await ApiService.searchChatHistory(search, page, 10);
      } else {
        response = await ApiService.getChatHistory(page, 10);
      }

      if (response.success && response.data) {
        setHistory(response.data.chatHistory);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      } else {
        setError(response.error || 'Failed to load chat history');
      }
    } catch (err) {
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadHistory(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadHistory(newPage, searchTerm);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const response = await ApiService.deleteChatHistoryEntry(entryId);
      if (response.success) {
        setHistory(prev => prev.filter(entry => entry.id !== entryId));
        setTotalItems(prev => prev - 1);
      } else {
        setError(response.error || 'Failed to delete entry');
      }
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
            {totalItems > 0 && (
              <span className="text-sm text-gray-500">({totalItems} entries)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your chat history..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No search results found' : 'No chat history yet'}
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelectHistory(entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTime(entry.created_at)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                          entry.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-800 mb-2">
                        {truncateText(entry.query, 80)}
                      </h3>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {truncateText(entry.response, 120)}
                      </div>

                      {entry.tokens_used && (
                        <div className="text-xs text-gray-500">
                          Tokens used: {entry.tokens_used}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry.id);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
