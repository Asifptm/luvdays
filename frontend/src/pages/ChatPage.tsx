import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Square,
  RefreshCw,
  AlertCircle,
  Send,
  Search,
  Bot,
  Plus,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import ApiService, { ChatResponse } from "../services/api";




import { WebSourcesList, RelatedPrompts, TypingWelcome } from "../components/ui";
import Profile from "../components/auth/Profile";
import AuthService, { User } from "../services/authService";
import ShareButton from "../features/ShareButton";
import AutoFormatContent from "../components/AutoFormatContent";
import FeedbackComponent from "../components/FeedbackComponent";
import ThinkingAnimation from "../components/ThinkingAnimation";
import logo from "../logo.svg";
import backgroundImage from "../background.jpg";




interface ChatMessage {
  id: string;
  query: string;
  response: ChatResponse;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [expandedWebSources, setExpandedWebSources] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [showWelcome, setShowWelcome] = useState(true);
  const [shouldLoadHistory, setShouldLoadHistory] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load recent chat history on mount if user is authenticated
  useEffect(() => {
    const loadRecentHistory = async () => {
      if (user && shouldLoadHistory) {
        try {
          const response = await ApiService.getChatHistory(1, 5); // Load last 5 entries
          if (response.success && response.data && response.data.chatHistory.length > 0) {
            // Convert ChatHistoryEntry to ChatMessage format
            const recentMessages: ChatMessage[] = response.data.chatHistory.map(entry => ({
              id: entry.id,
              query: entry.query,
              response: {
                success: entry.status === 'completed',
                query: entry.query,
                answer: entry.response,
                error: entry.error_message || undefined
              },
              timestamp: new Date(entry.created_at)
            }));
            setChatHistory(recentMessages);
          }
        } catch (error) {
          console.error('Failed to load recent chat history:', error);
        }
      }
    };

    loadRecentHistory();
  }, [user, shouldLoadHistory]);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollToBottom = () => {
        chatContainerRef.current!.scrollTo({
          top: chatContainerRef.current!.scrollHeight,
          behavior: "smooth",
        });
      };

      // Small delay to ensure content is rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [chatHistory, loading, currentQuery]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || loading) return;

      const submittedQuery = query.trim();
      setCurrentQuery(submittedQuery);
      setQuery("");
      setLoading(true);
      setError(null);
      setShowWelcome(false);
      setShouldLoadHistory(false); // Prevent loading history when user starts chatting

      try {
        const result = await ApiService.sendChatQuery(submittedQuery);

        // Add to chat history
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          query: submittedQuery,
          response: result,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, newMessage]);
        setCurrentQuery(""); // Clear current query after response
      } catch (error) {
        console.error("Error sending query:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get response";
        setError(errorMessage);

        const errorResponse = {
          success: false,
          error: errorMessage,
        };

        const errorMessageObj: ChatMessage = {
          id: Date.now().toString(),
          query: submittedQuery,
          response: errorResponse,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorMessageObj]);
        setCurrentQuery(""); // Clear current query after error
      } finally {
        setLoading(false);
      }
    },
    [query, loading],
  );



  const startNewChat = useCallback(() => {
    setChatHistory([]);
    setError(null);
    setQuery("");
    setCurrentQuery("");
    setExpandedWebSources(null);
    setShowWelcome(true);
    setShouldLoadHistory(false); // Prevent loading history when starting new chat
    // Force scroll to top to show welcome screen
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  // Handle related prompt click
  const handleRelatedPromptClick = useCallback((prompt: string) => {
    setQuery(prompt);
    // Focus the input after setting the query
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleRetry = useCallback(
    async (messageId: string) => {
      if (isRetrying) return;

      setIsRetrying(true);
      setError(null);

      try {
        const messageToRetry = chatHistory.find((msg) => msg.id === messageId);
        if (!messageToRetry) return;

        const result = await ApiService.sendChatQuery(messageToRetry.query);

        // Update the specific message in history
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, response: result } : msg,
          ),
        );
      } catch (error) {
        setError("Retry failed. Please try again.");
      } finally {
        setIsRetrying(false);
      }
    },
    [chatHistory, isRetrying],
  );



  const handleWebSourcesToggle = useCallback((messageId: string) => {
    setExpandedWebSources(prev => prev === messageId ? null : messageId);
  }, []);

  const handleCopyToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, []);

  const handleProfileClick = useCallback(() => {
    setShowProfile(true);
  }, []);

  const handleProfileClose = useCallback(() => {
    setShowProfile(false);
  }, []);



  const handleLogout = useCallback(() => {
    setUser(null);
    setShowProfile(false);
    // Redirect to auth page or reload
    window.location.reload();
  }, []);

  const handleFeedbackSubmit = useCallback(async (messageId: string, feedback: 'positive' | 'negative', comment?: string) => {
    try {
      // Send feedback to API
      const result = await ApiService.submitFeedback(messageId, feedback, comment);
      if (!result.success) {
        // Silently handle feedback submission failure
        // Don't throw error - let the UI show success state anyway
      }
    } catch (error) {
      // Silently handle feedback submission error
      // Don't throw error - let the UI show success state anyway
    }
  }, []);

  const formatAnswer = (answer: any) => {
    if (!answer) return <div className="text-gray-500 italic">No response available</div>;
    
    // Handle different response formats
    let contentToFormat = answer;
    
    // If it's a ChatResponse object, extract the answer
    if (typeof answer === 'object' && answer.answer) {
      contentToFormat = answer.answer;
    }
    
    // If it's a string, use it directly
    if (typeof answer === 'string') {
      contentToFormat = answer;
    }
    
    // If it's still an object, try to stringify it
    if (typeof contentToFormat === 'object') {
      contentToFormat = JSON.stringify(contentToFormat, null, 2);
    }
    
    return (
      <AutoFormatContent 
        content={contentToFormat}
        className="max-w-none text-base"
      />
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };



  return (
    <div 
      className={`w-full h-screen relative ${
        showWelcome && chatHistory.length === 0 && !loading && !currentQuery
          ? 'bg-cover bg-center bg-no-repeat'
          : 'bg-white'
      }`}
      style={
        showWelcome && chatHistory.length === 0 && !loading && !currentQuery
          ? {
              backgroundImage: `url(${backgroundImage})`,
            }
          : {}
      }
    >
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-10 px-4 py-3 flex justify-between items-center ${
        showWelcome && chatHistory.length === 0 && !loading && !currentQuery
          ? ''
          : ''
      }`}>
        <div className="flex items-center">
          {/* Show Logo in welcome state, New Chat button when chatting */}
          {showWelcome && chatHistory.length === 0 ? (
            <img 
              src={logo} 
              alt="Days AI Logo" 
              className="h-20 w-auto"
            />
          ) : (
            <button
              onClick={startNewChat}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="New Chat"
            >
              <Plus size={18} />
              <span className="text-sm font-medium hidden sm:block">New Chat</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Chat History Button - Hidden */}
          {/* {user && (
            <button
              onClick={handleHistoryClick}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Chat History"
            >
              <History size={18} />
            </button>
          )} */}

          {/* Share Button */}
          {chatHistory.length > 0 && (
            <ShareButton
              chatHistory={chatHistory}
              onShareSuccess={(shareUrl) => {
                console.log('Chat shared successfully:', shareUrl);
              }}
              onShareError={(error) => {
                console.error('Failed to share chat:', error);
              }}
            />
          )}

          {/* Profile Button */}
          {user && (
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Profile"
            >
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={chatContainerRef}
        className="w-full h-full overflow-y-auto px-4 pt-16 pb-20"
      >
                  {/* Welcome Message */}
          {showWelcome && chatHistory.length === 0 && !loading && !currentQuery && (
            <div className="flex items-center justify-center h-full">
              <TypingWelcome />
            </div>
          )}

        {/* Chat History */}
        {chatHistory.map((message, index) => (
          <div key={message.id} className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Divider between messages */}
            {index > 0 && (
              <div className="border-t border-gray-200 my-8"></div>
            )}
            {/* Question Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <UserIcon size={14} className="sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed">
                {message.query}
              </h2>

              {/* Source Tags */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setExpandedWebSources(null)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                    expandedWebSources === null
                      ? "bg-green-200 text-green-800 border-green-300"
                      : "bg-green-100 text-green-700 border-green-200 hover:bg-green-150"
                  }`}
                >
                  <Square size={12} className="sm:w-[14px] sm:h-[14px]" />
                  Days AI
                </button>
                {message.response.sources && message.response.sources.length > 0 && (
                  <button
                    onClick={() => handleWebSourcesToggle(message.id)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      expandedWebSources === message.id
                        ? "bg-blue-200 text-blue-800 border-blue-300"
                        : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-150"
                    }`}
                  >
                    <Search size={12} className="sm:w-[14px] sm:h-[14px]" />
                    Web Sources ({message.response.sources.length})
                  </button>
                )}
              </div>
            </div>

            {/* Answer */}
            {message.response.success ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                {/* Content Display */}
                {expandedWebSources === message.id && message.response.sources && message.response.sources.length > 0 ? (
                  /* Web Sources Content */
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <WebSourcesList 
                      sources={message.response.sources}
                      onCopyUrl={handleCopyToClipboard}
                    />
                  </div>
                ) : (
                  /* Response Answer */
                  <div className="text-gray-700 leading-relaxed max-w-none text-sm sm:text-base">
                    {formatAnswer(message.response.answer || "")}
                  </div>
                )}



                {/* Related Prompts */}
                <RelatedPrompts
                  prompts={message.response.related_prompts || []}
                  onPromptClick={handleRelatedPromptClick}
                />

                {/* Feedback Component */}
                <FeedbackComponent
                  messageId={message.id}
                  onFeedbackSubmit={handleFeedbackSubmit}
                />
              </div>
            ) : (
              /* Error Response */
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle size={14} className="sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <p className="text-red-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Error occurred
                  </p>
                  <p className="text-red-600 text-xs sm:text-sm">
                    {message.response.error}
                  </p>
                  <button
                    onClick={() => handleRetry(message.id)}
                    disabled={isRetrying}
                    className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm"
                  >
                    <RefreshCw
                      size={14}
                      className={`sm:w-4 sm:h-4 ${isRetrying ? "animate-spin" : ""}`}
                    />
                    <span>{isRetrying ? "Retrying..." : "Retry"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Current Query with Shimmer */}
        {currentQuery && (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Divider */}
            {chatHistory.length > 0 && (
              <div className="border-t border-gray-200 my-8"></div>
            )}
            
            {/* Question Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <UserIcon size={14} className="sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {formatTime(new Date())}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuery}
              </h2>

              {/* Source Tags */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  <Square size={12} className="sm:w-[14px] sm:h-[14px]" />
                  Days AI
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                  <Square size={12} className="sm:w-[14px] sm:h-[14px]" />
                  Web Sources
                </span>
              </div>
            </div>

            {/* Shimmer Loading Effect */}
            {loading && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                  <div className="w-16 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                </div>
                
                {/* Thinking Animation */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ThinkingAnimation className="mb-3" />
                  <div className="text-xs text-gray-500">
                    This may take a few moments while we process your request...
                  </div>
                </div>
                
                {/* Shimmer Lines */}
                <div className="space-y-3">
                  <div className="h-4 rounded animate-shimmer w-3/4"></div>
                  <div className="h-4 rounded animate-shimmer w-full"></div>
                  <div className="h-4 rounded animate-shimmer w-5/6"></div>
                  <div className="h-4 rounded animate-shimmer w-4/5"></div>
                  <div className="h-4 rounded animate-shimmer w-3/5"></div>
                </div>

                {/* Shimmer Bullet Points */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 animate-shimmer"></div>
                    <div className="h-4 rounded animate-shimmer flex-1"></div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 animate-shimmer"></div>
                    <div className="h-4 rounded animate-shimmer flex-1"></div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 animate-shimmer"></div>
                    <div className="h-4 rounded animate-shimmer w-4/5"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && !loading && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle size={18} className="sm:w-5 sm:h-5 text-red-500" />
                <span className="text-red-700 font-medium text-sm sm:text-base">Error</span>
              </div>
              <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Input */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className={`flex items-end space-x-3 border-2 border-gray-100 rounded-2xl shadow-lg px-4 py-3 focus-within:border-gray-400 transition-colors duration-200 ${
              showWelcome && chatHistory.length === 0 && !loading && !currentQuery
                ? 'bg-white/90 backdrop-blur-sm'
                : 'bg-white'
            }`}>
              {/* AI Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
              </div>
              
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 text-gray-800 placeholder-gray-500 text-sm sm:text-base focus:outline-none resize-none border-none outline-none bg-transparent min-h-[20px] max-h-32 overflow-y-auto"
                disabled={loading}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && user && (
        <Profile 
          user={user}
          onLogout={handleLogout}
          onClose={handleProfileClose}
        />
      )}

      {/* Chat History Modal - Hidden since button is hidden */}
      {/* {showHistory && (
        <ChatHistory
          onSelectHistory={handleHistorySelect}
          onClose={handleHistoryClose}
        />
      )} */}
    </div>
  );
};

export default ChatPage;
