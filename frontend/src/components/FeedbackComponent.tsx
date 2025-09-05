import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface FeedbackComponentProps {
  messageId: string;
  onFeedbackSubmit: (messageId: string, feedback: 'positive' | 'negative', comment?: string) => void;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ messageId, onFeedbackSubmit }) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    if (type === 'negative') {
      setShowComment(true);
    } else {
      handleSubmit(type);
    }
  };

  const handleSubmit = (type?: 'positive' | 'negative') => {
    const feedbackType = type || feedback;
    if (feedbackType) {
      onFeedbackSubmit(messageId, feedbackType, comment);
      setIsSubmitted(true);
      setShowComment(false);
      setComment('');
    }
  };

  const handleCommentSubmit = () => {
    if (feedback) {
      handleSubmit();
    }
  };

  if (isSubmitted) {
    return (
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="flex items-center justify-center">
          {feedback === 'positive' ? (
            <div className="flex items-center space-x-2 text-green-600">
              <ThumbsUp size={18} className="text-green-600" />
              <span className="text-sm font-medium">Helpful</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <ThumbsDown size={18} className="text-red-600" />
              <span className="text-sm font-medium">Not helpful</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 font-medium">Was this response helpful?</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleFeedback('positive')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              feedback === 'positive'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <ThumbsUp size={16} />
            <span className="hidden sm:inline">Yes</span>
          </button>
          
          <button
            onClick={() => handleFeedback('negative')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              feedback === 'negative'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <ThumbsDown size={16} />
            <span className="hidden sm:inline">No</span>
          </button>
        </div>
      </div>

      {showComment && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-2">
            <MessageSquare size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <label htmlFor={`comment-${messageId}`} className="block text-sm font-medium text-gray-700 mb-2">
                What could we improve?
              </label>
              <textarea
                id={`comment-${messageId}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts to help us improve..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-end space-x-2 mt-3">
                <button
                  onClick={() => {
                    setShowComment(false);
                    setComment('');
                    setFeedback(null);
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;
