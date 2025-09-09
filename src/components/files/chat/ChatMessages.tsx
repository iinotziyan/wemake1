import { useRef, useEffect, useState } from 'react';
import CustomScrollbar from '../../ui/custom-scrollbar';
import { FileText, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import TypingAnimation from '../../chat/TypingAnimation';
import { FileOperationProgress } from './FileOperationProgress';
import { SuggestedPrompts } from './SuggestedPrompts';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  files?: File[];
  showProgress?: boolean;
  progressOperation?: string;
  isPersistentProgress?: boolean;
  isProgressCompleted?: boolean;
  isProgressCancelled?: boolean;
  cancellationReason?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  showProgress?: boolean;
  progressOperation?: string;
  isInitialLoad?: boolean;
  showCenterPrompts?: boolean;
  centerPrompts?: string[];
  onCenterPromptClick?: (prompt: string) => void;
}

export const ChatMessages = ({ 
  messages, 
  isLoading, 
  showProgress = false, 
  progressOperation = '',
  isInitialLoad = false,
  showCenterPrompts = false,
  centerPrompts = [],
  onCenterPromptClick
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showProgress]);

  const handleFilePreview = (file: File) => {
    // Dispatch event to show file in preview section
    const event = new CustomEvent('showFileInPreview', { detail: { file } });
    window.dispatchEvent(event);
  };

  // Show all messages including cancelled ones
  const filteredMessages = messages;

  return (
    <CustomScrollbar className="flex-1 p-4">
      <div className="space-y-4 h-full">
        {/* Show center prompts when no messages and showCenterPrompts is true */}
        {filteredMessages.length === 0 && showCenterPrompts && (
          <SuggestedPrompts 
            prompts={centerPrompts}
            onPromptClick={onCenterPromptClick || (() => {})}
            isVisible={showCenterPrompts}
            variant="center"
          />
        )}
        
        {filteredMessages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble 
              message={message} 
              index={index} 
              onFilePreview={handleFilePreview}
              isLatest={index === filteredMessages.length - 1}
              shouldAnimate={!isInitialLoad && index === filteredMessages.length - 1}
            />
            {message.showProgress && (
              <FileOperationProgress 
                operation={message.progressOperation || 'Processing'} 
                isVisible={true}
                isPersistent={message.isPersistentProgress}
                isCompleted={message.isProgressCompleted}
                isCancelled={message.isProgressCancelled}
                cancellationReason={message.cancellationReason}
              />
            )}
          </div>
        ))}
        {showProgress && (
          <FileOperationProgress 
            operation={progressOperation} 
            isVisible={true} 
          />
        )}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </CustomScrollbar>
  );
};

const MessageBubble = ({ 
  message, 
  index, 
  onFilePreview,
  isLatest,
  shouldAnimate
}: { 
  message: Message; 
  index: number; 
  onFilePreview: (file: File) => void;
  isLatest: boolean;
  shouldAnimate: boolean;
}) => {
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

  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-[80%] ${message.sender === 'user' ? 'flex flex-col items-end' : ''} relative`}>
        {/* Show files above user messages */}
        {message.sender === 'user' && message.files && message.files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 justify-end">
            {message.files.map((file, fileIndex) => (
              <div
                key={fileIndex}
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
          className={`p-4 break-words overflow-wrap-anywhere transition-all duration-300 hover:shadow-lg relative ${
            message.sender === 'user'
              ? 'bg-white text-black rounded-[20px] hover:bg-gray-100'
              : 'bg-[#1a1a1a] text-white rounded-[20px] hover:bg-[#222]'
          }`}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {message.sender === 'ai' && isLatest && shouldAnimate ? (
            <TypingAnimation text={message.content} speed={1} />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Hover actions below the message with smooth animation */}
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

const LoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-[#1a1a1a] text-white rounded-[20px] p-4 max-w-[80%]">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);
