import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { AssistantMessage as AssistantMessageType } from './types';

interface AssistantMessageProps {
  message: AssistantMessageType;
  isTyping: boolean;
  compact?: boolean;
  className?: string;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  isTyping,
  compact = false,
  className
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(message.content);
      return;
    }

    // Reset when new message
    setDisplayedText('');
    setCurrentIndex(0);

    // Typing animation
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= message.content.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [message.content, isTyping]);

  useEffect(() => {
    if (isTyping && currentIndex <= message.content.length) {
      setDisplayedText(message.content.slice(0, currentIndex));
    }
  }, [currentIndex, message.content, isTyping]);

  const getMessageStyle = () => {
    switch (message.type) {
      case 'welcome':
        return 'text-foreground';
      case 'guidance':
        return 'text-foreground font-medium';
      case 'encouragement':
        return 'text-warm-primary';
      case 'celebration':
        return 'text-earth-primary font-medium';
      case 'support':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <p
        className={cn(
          'leading-relaxed transition-all duration-200',
          getMessageStyle(),
          compact ? 'text-sm' : 'text-base',
          isTyping && 'min-h-[1.5em]'
        )}
      >
        {displayedText}
        {isTyping && (
          <span className="inline-block w-2 h-4 ml-1 bg-warm-primary/50 animate-pulse" />
        )}
      </p>

      {message.actionSuggestion && !isTyping && (
        <Button
          variant={message.actionSuggestion.priority === 'high' ? 'default' : 'outline'}
          size={compact ? 'sm' : 'default'}
          onClick={message.actionSuggestion.action}
          className={cn(
            'transition-all duration-200',
            message.actionSuggestion.priority === 'high' &&
              'bg-warm-primary hover:bg-warm-primary/90'
          )}
        >
          {message.actionSuggestion.text}
        </Button>
      )}
    </div>
  );
};
