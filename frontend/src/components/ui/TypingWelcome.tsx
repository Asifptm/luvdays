import React, { useState, useEffect } from 'react';

interface TypingWelcomeProps {
  className?: string;
}

const TypingWelcome: React.FC<TypingWelcomeProps> = ({ className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  const fullText = "Get answers, perspectives, and recommendations from people and creators you love.";
  
  useEffect(() => {
    if (currentIndex < fullText.length && isTyping) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Typing speed
      
      return () => clearTimeout(timeout);
    } else if (currentIndex >= fullText.length) {
      setIsTyping(false);
    }
  }, [currentIndex, isTyping, fullText]);

  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      {/* Main Content - Centered */}
      <div className="text-center px-4 space-y-4">
        {/* Typing Message */}
        <div className="min-h-[60px] sm:min-h-[80px] flex items-center justify-center">
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-800 leading-relaxed max-w-3xl mx-auto font-medium">
            {displayText}
            {isTyping && (
              <span className="inline-block w-1 h-6 sm:h-8 lg:h-10 bg-gray-800 ml-2 animate-pulse" />
            )}
          </p>
        </div>

        {/* Subtitle */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '3s', animationFillMode: 'forwards' }}>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto">
            Your intelligent companion for meaningful conversations and insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypingWelcome;
