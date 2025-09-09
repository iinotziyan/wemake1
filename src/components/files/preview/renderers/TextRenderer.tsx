
import { useState, useEffect } from 'react';
import CustomSlider from '../../../sidebar/CustomSlider';
import TypingAnimation from '../../../chat/TypingAnimation';

interface TextRendererProps {
  file: any;
  isEditing: boolean;
  editContent: string;
  currentFileContent: string;
  isAnimatingContent: boolean;
  animatedContent: string;
  onEditContentChange: (content: string) => void;
  onAnimationComplete: () => void;
}

export const TextRenderer = ({ 
  file, 
  isEditing, 
  editContent, 
  currentFileContent, 
  isAnimatingContent, 
  animatedContent, 
  onEditContentChange, 
  onAnimationComplete 
}: TextRendererProps) => {
  if (!((file.type === 'text/plain' || file.type === 'text/markdown') && (currentFileContent || file.content || isAnimatingContent || isEditing))) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {isEditing ? (
        <div className="flex-1 p-6 overflow-hidden">
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="w-full h-full bg-transparent text-white text-sm leading-relaxed font-mono border-none resize-none focus:outline-none overflow-auto file-chat-textarea"
            placeholder="Start typing your document..."
            style={{ 
              minHeight: '100%',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(64 64 64) transparent'
            }}
          />
          <style>{`
            .file-chat-textarea::-webkit-scrollbar {
              width: 6px;
            }
            .file-chat-textarea::-webkit-scrollbar-track {
              background: transparent;
            }
            .file-chat-textarea::-webkit-scrollbar-thumb {
              background-color: rgb(64 64 64);
              border-radius: 3px;
              border: none;
              transition: background-color 0.15s ease-in-out;
            }
            .file-chat-textarea::-webkit-scrollbar-thumb:hover {
              background-color: rgb(115 115 115);
            }
          `}</style>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-hidden">
          <CustomSlider isOpen={true} className="h-full">
            <pre className="text-white whitespace-pre-wrap text-sm leading-relaxed">
              {isAnimatingContent ? (
                <TypingAnimation 
                  text={animatedContent} 
                  speed={8} 
                  onComplete={onAnimationComplete}
                />
              ) : (
                currentFileContent || file.content || (file.name === 'untitled.md' ? 'Start typing your document...' : '')
              )}
            </pre>
          </CustomSlider>
        </div>
      )}
    </div>
  );
};
