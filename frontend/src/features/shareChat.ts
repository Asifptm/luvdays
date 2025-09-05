export interface ShareableChat {
  id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  shareUrl?: string;
}

export class ShareChatService {
  private static generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  static async shareChat(chat: ShareableChat): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    try {
      // Generate a unique share ID
      const shareId = this.generateShareId();
      
      // Create shareable data
      const shareData = {
        id: shareId,
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        sharedAt: new Date()
      };

      // Store in localStorage for now (in a real app, you'd save to backend)
      const sharedChats = JSON.parse(localStorage.getItem('sharedChats') || '{}');
      sharedChats[shareId] = shareData;
      localStorage.setItem('sharedChats', JSON.stringify(sharedChats));

      // Generate share URL
      const shareUrl = `${window.location.origin}/shared-chat/${shareId}`;
      
      return {
        success: true,
        shareUrl
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to share chat'
      };
    }
  }

  static async getSharedChat(shareId: string): Promise<ShareableChat | null> {
    try {
      const sharedChats = JSON.parse(localStorage.getItem('sharedChats') || '{}');
      const sharedChat = sharedChats[shareId];
      
      if (!sharedChat) {
        return null;
      }

      return {
        id: sharedChat.id,
        title: sharedChat.title,
        messages: sharedChat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        createdAt: new Date(sharedChat.createdAt),
        shareUrl: `${window.location.origin}/shared-chat/${shareId}`
      };
    } catch (error) {
      return null;
    }
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  static generateChatTitle(messages: Array<{ role: string; content: string }>): string {
    if (messages.length === 0) return 'New Chat';
    
    // Use the first user message as the title
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.substring(0, 50);
      return title.length === 50 ? title + '...' : title;
    }
    
    return 'New Chat';
  }
}
