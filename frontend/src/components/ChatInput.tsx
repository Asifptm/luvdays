import React, { useRef, useEffect } from "react";
import { Square, Send, Search } from "lucide-react";

// Shimmer loading component
const ShimmerLoader: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
        <Square size={14} className="sm:w-4 sm:h-4 text-white" />
      </div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
    </div>

    {/* Introduction text shimmer */}
    <div className="mb-4 sm:mb-6">
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3"></div>
    </div>

    {/* Numbered list shimmer */}
    <div className="space-y-4 sm:space-y-6">
      {[1, 2, 3].map((item) => (
        <div key={item} className="space-y-2 sm:space-y-3">
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface ChatInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  currentQuery: string;
  activeTab: "days" | "web";
  setActiveTab: (tab: "days" | "web") => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  query,
  setQuery,
  onSubmit,
  loading,
  currentQuery,
  activeTab,
  setActiveTab,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and after each response
  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Focus input when query changes (for related prompts)
  useEffect(() => {
    if (inputRef.current && query) {
      inputRef.current.focus();
    }
  }, [query]);

  return (
    <>
      {/* Current Query Display with Shimmer Loading */}
      {currentQuery && (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4">
          {/* Question */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">U</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">Just now</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed">
              {currentQuery}
            </h2>

            {/* Source Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setActiveTab("days")}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === "days"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                <Square size={14} className="sm:w-4 sm:h-4" />
                <span>Days AI</span>
              </button>
              <button
                onClick={() => setActiveTab("web")}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === "web"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                <Search size={14} className="sm:w-4 sm:h-4" />
                <span>Web Sources</span>
              </button>
            </div>
          </div>

          {/* Shimmer Loading Response */}
          <div>
            <ShimmerLoader />
          </div>
        </div>
      )}

      {/* Footer Input */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4 sticky bottom-0">
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-green-500 rounded-full bg-white flex items-center justify-center">
                <Square size={18} className="sm:w-5 sm:h-5 text-green-500" />
              </div>
            </div>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Follow up question"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xs text-gray-500 text-center">
            Press Enter to send • Esc to clear
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatInput;
