
import React, { useState } from 'react';
import { FileText, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from './MessageHandling';
import TypingAnimation from './TypingAnimation';

interface ChatMessageProps {
  message: Message;
  onFilePreview: (file: File) => void;
  isLatest?: boolean;
  shouldAnimate?: boolean;
}

const ChatMessage = ({ message, onFilePreview, isLatest = false, shouldAnimate = false }: ChatMessageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [actionsHovered, setActionsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);
  const [likeClicked, setLikeClicked] = useState(false);
  const [dislikeClicked, setDislikeClicked] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    console.log('Message copied to clipboard');
    setCopyClicked(true);
    setTimeout(() => setCopyClicked(false), 500);
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 1000);
  };

  const handleLike = () => {
    console.log('Liked message:', message.id);
    setLikeClicked(true);
    setTimeout(() => setLikeClicked(false), 500);
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 1000);
  };

  const handleDislike = () => {
    console.log('Disliked message:', message.id);
    setDislikeClicked(true);
    setTimeout(() => setDislikeClicked(false), 500);
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 1000);
  };

  const showActions = isHovered || actionsHovered || isInteracting;

  // Enhanced animation control - only animate if explicitly requested AND conditions are met
  const shouldUseTypingAnimation = 
    message.sender === 'ai' && 
    isLatest && 
    shouldAnimate && 
    message.shouldAnimate === true && 
    message.content.length > 0;

  return (
    <div 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-[70%] ${message.sender === 'user' ? 'flex flex-col items-end' : ''} relative`}>
        {message.sender === 'user' && message.files && message.files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 justify-end">
            {message.files.map((file, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-[#2a2a2a] border border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                onClick={() => onFilePreview(file)}
                title={file.name}
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        )}
        
        <div
          className={`p-4 break-words overflow-wrap-anywhere transition-all duration-300 hover:shadow-lg ${
            message.sender === 'user'
              ? 'bg-white text-black rounded-[20px] hover:bg-gray-100'
              : 'bg-[#1a1a1a] text-white rounded-[20px] hover:bg-[#222]'
          }`}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          <p className="text-sm whitespace-pre-wrap">
            {shouldUseTypingAnimation ? (
              <TypingAnimation 
                text={message.content} 
                speed={3}
              />
            ) : (
              message.content
            )}
          </p>
        </div>

        {/* Hover actions */}
        <div 
          className={`flex gap-1 mt-2 transition-all duration-300 ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          } ${
            showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
          onMouseEnter={() => setActionsHovered(true)}
          onMouseLeave={() => setActionsHovered(false)}
        >
          <button
            onClick={handleCopyMessage}
            className={`p-2 rounded-full transition-all duration-200 ${
              copyClicked 
                ? 'text-white bg-green-600' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Copy message"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-all duration-200 ${
              likeClicked 
                ? 'text-white bg-green-600' 
                : 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
            }`}
            title="Like"
            onMouseDown={(e) => e.preventDefault()}
          >
            <ThumbsUp className="w-3 h-3" />
          </button>
          <button
            onClick={handleDislike}
            className={`p-2 rounded-full transition-all duration-200 ${
              dislikeClicked 
                ? 'text-white bg-red-600' 
                : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
            }`}
            title="Dislike"
            onMouseDown={(e) => e.preventDefault()}
          >
            <ThumbsDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
