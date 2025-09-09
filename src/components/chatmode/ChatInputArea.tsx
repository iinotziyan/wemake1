
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploadArea from './FileUploadArea';
import AttachmentPopover from './AttachmentPopover';
import ModelSelectorPopover from './ModelSelectorPopover';

interface ChatInputAreaProps {
  prompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  onFilePreview: (file: File) => void;
  attachPopoverOpen: boolean;
  onAttachPopoverChange: (open: boolean) => void;
  onAttachMenuClick: (label: string) => void;
  modelPopoverOpen?: boolean;
  onModelPopoverChange?: (open: boolean) => void;
  onModelMenuClick?: (label: string) => void;
}

const ChatInputArea = ({
  prompt,
  onPromptChange,
  onSubmit,
  uploadedFiles,
  onRemoveFile,
  onFilePreview,
  attachPopoverOpen,
  onAttachPopoverChange,
  onAttachMenuClick,
  modelPopoverOpen = false,
  onModelPopoverChange = () => {},
  onModelMenuClick = () => {}
}: ChatInputAreaProps) => {
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    const handleAutoModeToggle = (event: CustomEvent) => {
      const enabled = event.detail.enabled;
      setAutoModeEnabled(enabled);
      
      if (enabled) {
        setShowGlow(true);
        // Hide glow after 1 second
        const timer = setTimeout(() => {
          setShowGlow(false);
        }, 1000);
        
        return () => clearTimeout(timer);
      } else {
        setShowGlow(false);
      }
    };

    window.addEventListener('autoModeToggle', handleAutoModeToggle as EventListener);
    
    return () => {
      window.removeEventListener('autoModeToggle', handleAutoModeToggle as EventListener);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim()) {
        onSubmit(e as any);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e);
    
    // Reset height to auto to get the natural scroll height
    e.target.style.height = 'auto';
    
    // Calculate new height based on scroll height
    const scrollHeight = e.target.scrollHeight;
    const minHeight = 60;
    const maxHeight = 200;
    
    // Only expand if content actually needs more space
    const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
    e.target.style.height = `${newHeight}px`;
  };

  return (
    <div className={`bg-[#242628] border border-[rgb(65,65,65)] rounded-[25px] relative overflow-hidden transition-all duration-500 mx-auto ${
      showGlow ? 'shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(0,191,255,0.4)] border-white/30' : ''
    }`} style={{ width: '800px' }}>
      <style>{`
        .chat-textarea {
          scrollbar-width: thin;
          scrollbar-color: rgb(64 64 64) transparent;
        }
        
        .chat-textarea::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-textarea::-webkit-scrollbar-thumb {
          background-color: rgb(64 64 64);
          border-radius: 3px;
          border: none;
          transition: background-color 0.15s ease-in-out;
        }
        
        .chat-textarea::-webkit-scrollbar-thumb:hover {
          background-color: rgb(115 115 115);
        }

        .auto-mode-glow {
          animation: gentle-glow 3s ease-in-out infinite alternate;
        }

        @keyframes gentle-glow {
          0% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2), 0 0 40px rgba(0, 191, 255, 0.3);
          }
          100% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.4), 0 0 60px rgba(0, 191, 255, 0.5);
          }
        }
      `}</style>
      <form onSubmit={onSubmit}>
        <div className="p-2 pb-0">
          {/* File Upload Area - with hidden scrollbar */}
          <div className="max-h-32 overflow-y-auto mb-2 hide-upload-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <style>{`
              .hide-upload-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-upload-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            <FileUploadArea
              uploadedFiles={uploadedFiles}
              onRemoveFile={onRemoveFile}
              onFilePreview={onFilePreview}
            />
          </div>
          
          <textarea
            placeholder=""
            value={prompt}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            maxLength={5000}
            className="chat-textarea w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-none text-lg resize-none"
            style={{
              minHeight: '60px',
              maxHeight: '200px',
              height: '60px',
              transition: 'height 0.1s ease-out'
            }}
          />
        </div>
        
        {/* Separate Button Area with Blur Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#242628]/60 backdrop-blur-sm rounded-b-[25px]"></div>
          <div className="relative p-2 flex items-center justify-between rounded-b-[25px]">
            <div className="flex items-center gap-2">
              <AttachmentPopover
                isOpen={attachPopoverOpen}
                onOpenChange={onAttachPopoverChange}
                onMenuItemClick={onAttachMenuClick}
              />
              
              <ModelSelectorPopover
                isOpen={modelPopoverOpen}
                onOpenChange={onModelPopoverChange}
                onMenuItemClick={onModelMenuClick}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-white hover:bg-gray-200 text-black rounded-full w-8 h-8 p-0"
                disabled={!prompt.trim()}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInputArea;
