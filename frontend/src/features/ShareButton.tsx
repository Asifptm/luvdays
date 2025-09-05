import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { ShareChatService, ShareableChat } from './shareChat';

interface ShareButtonProps {
  chatHistory: Array<{
    id: string;
    query: string;
    response: any;
    timestamp: Date;
  }>;
  onShareSuccess?: (shareUrl: string) => void;
  onShareError?: (error: string) => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  chatHistory, 
  onShareSuccess, 
  onShareError 
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    if (chatHistory.length === 0) {
      onShareError?.('No chat history to share');
      return;
    }

    setIsSharing(true);
    setIsCopied(false);

    try {
      // Convert chat history to shareable format
      const userMessages = chatHistory.map(msg => ({
        role: 'user' as const,
        content: msg.query,
        timestamp: msg.timestamp
      }));
      
      const assistantMessages = chatHistory.map(msg => ({
        role: 'assistant' as const,
        content: msg.response.answer || msg.response.error || 'No response',
        timestamp: msg.timestamp
      }));
      
      const messages = [...userMessages, ...assistantMessages];

      const shareableChat: ShareableChat = {
        id: Date.now().toString(),
        title: ShareChatService.generateChatTitle(messages),
        messages,
        createdAt: new Date()
      };

      const result = await ShareChatService.shareChat(shareableChat);

      if (result.success && result.shareUrl) {
        setShareUrl(result.shareUrl);
        onShareSuccess?.(result.shareUrl);
      } else {
        onShareError?.(result.error || 'Failed to share chat');
      }
    } catch (error) {
      onShareError?.('Failed to share chat');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;

    const success = await ShareChatService.copyToClipboard(shareUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={isSharing || chatHistory.length === 0}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Share this chat"
      >
        {isSharing ? (
          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Share2 size={18} />
        )}
      </button>

      {/* Share URL Modal */}
      {shareUrl && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-800">Share Chat</h3>
            <button
              onClick={() => setShareUrl(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">Share this URL with others:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
              />
              <button
                onClick={handleCopyUrl}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                title="Copy URL"
              >
                {isCopied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            This chat will be accessible to anyone with the link.
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
