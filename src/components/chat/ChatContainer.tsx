
import React, { useRef, useEffect } from 'react';
import { Message } from './MessageHandling';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';
import CustomScrollbar from '../ui/custom-scrollbar';

interface ChatContainerProps {
  messages: Message[];
  onFilePreview: (file: File) => void;
  isLoading?: boolean;
}

const ChatContainer = ({ messages, onFilePreview, isLoading = false }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Only scroll on loading state change, not continuously
  useEffect(() => {
    if (isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLoading]);

  // Show loading indicator when:
  // 1. Actually loading
  // 2. Either there are no messages (first message) OR there are messages and the last one is not an empty AI placeholder
  const shouldShowLoadingIndicator = isLoading && (
    messages.length === 0 || 
    (messages.length > 0 && !(messages[messages.length - 1]?.sender === 'ai' && messages[messages.length - 1]?.content === ''))
  );

  return (
    <CustomScrollbar className="h-full" height="100%">
      <div className="p-4">
        {/* Add gap at the top where header was removed */}
        <div className="h-16"></div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFilePreview={onFilePreview}
              isLatest={index === messages.length - 1}
              shouldAnimate={index === messages.length - 1 && message.sender === 'ai' && message.shouldAnimate === true}
            />
          ))}
          
          {/* Show loading indicator for first message or subsequent messages */}
          {shouldShowLoadingIndicator && <LoadingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </CustomScrollbar>
  );
};

export default ChatContainer;
