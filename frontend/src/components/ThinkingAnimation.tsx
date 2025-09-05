import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Search, Database, Sparkles } from 'lucide-react';

interface ThinkingAnimationProps {
  className?: string;
}

const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentText, setCurrentText] = useState('');

  const thinkingSteps = useMemo(() => [
    { text: 'Thinking...', icon: Brain, color: 'text-blue-600' },
    { text: 'Analyzing your question...', icon: Search, color: 'text-purple-600' },
    { text: 'Gathering information...', icon: Database, color: 'text-green-600' },
    { text: 'Processing data...', icon: Sparkles, color: 'text-orange-600' },
    { text: 'Crafting response...', icon: Brain, color: 'text-indigo-600' }
  ], []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % thinkingSteps.length);
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [thinkingSteps.length]);

  useEffect(() => {
    const currentStepData = thinkingSteps[currentStep];
    let charIndex = 0;
    setCurrentText('');

    const textInterval = setInterval(() => {
      if (charIndex < currentStepData.text.length) {
        setCurrentText(currentStepData.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(textInterval);
      }
    }, 50);

    return () => clearInterval(textInterval);
  }, [currentStep, thinkingSteps]);

  const currentStepData = thinkingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <IconComponent 
          size={20} 
          className={`${currentStepData.color} animate-thinking-pulse`} 
        />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
      </div>
      <div className="flex items-center space-x-1">
        <span className={`text-sm font-medium animate-text-shimmer`}>
          {currentText}
        </span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingAnimation;
