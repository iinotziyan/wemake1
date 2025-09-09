
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronDown, FileText, Upload, Square, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import FileUploadArea from '../../chatmode/FileUploadArea';
import { SuggestedPrompts } from './SuggestedPrompts';

interface ChatInputProps {
  selectedFile: string | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  setMessages: (messages: any) => void;
  setIsLoading: (loading: boolean) => void;
  uploadedFiles: File[];
  handleRemoveFile: (index: number) => void;
  handleFilePreview: (file: File) => void;
  attachPopoverOpen: boolean;
  setAttachPopoverOpen: (open: boolean) => void;
  handleAttachMenuClick: (label: string) => void;
  modelPopoverOpen: boolean;
  setModelPopoverOpen: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: (message: string, files: File[]) => void;
  canCancelTask?: boolean;
  isTaskInProgress?: boolean;
  isChatBlocked?: boolean;
  showSuggestedPrompts?: boolean;
  suggestedPrompts?: string[];
  onSuggestedPromptClick?: (prompt: string) => void;
}

export const ChatInput = ({
  selectedFile,
  prompt,
  setPrompt,
  setMessages,
  setIsLoading,
  uploadedFiles,
  handleRemoveFile,
  handleFilePreview,
  attachPopoverOpen,
  setAttachPopoverOpen,
  handleAttachMenuClick,
  modelPopoverOpen,
  setModelPopoverOpen,
  fileInputRef,
  handleFileChange,
  onSendMessage,
  canCancelTask = false,
  isTaskInProgress = false,
  isChatBlocked = false,
  showSuggestedPrompts = false,
  suggestedPrompts = [],
  onSuggestedPromptClick
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Remove attach menu items with paperclip
  const attachMenuItems = [
    { icon: Upload, label: 'Upload a file' },
    { icon: FileText, label: 'Add Text Content' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isTaskInProgress && !isChatBlocked) {
      onSendMessage(prompt, uploadedFiles);
      setPrompt('');
    }
  };

  const handleCancelTask = () => {
    if (canCancelTask) {
      const event = new CustomEvent('cancelCurrentTask');
      window.dispatchEvent(event);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isTaskInProgress && !isChatBlocked) {
        handleSubmit(e as any);
      }
    }
  };

  const calculateHeight = () => {
    const lines = prompt.split('\n').length;
    const baseHeight = 60;
    const lineHeight = 20;
    const maxHeight = 150;
    
    const calculatedHeight = Math.max(baseHeight, Math.min(maxHeight, baseHeight + (lines - 1) * lineHeight));
    return `${calculatedHeight}px`;
  };

  const getPlaceholderText = () => {
    if (isChatBlocked) return "Chat blocked for unsupported file type";
    if (isTaskInProgress) return "AI is processing...";
    return "Type your message...";
  };

  const isInputDisabled = isTaskInProgress || isChatBlocked;

  return (
    <div className="border-t border-[#1C1C1C]">
      {/* Fix 3: Suggested Prompts without Separator */}
      {showSuggestedPrompts && (
        <SuggestedPrompts 
          prompts={suggestedPrompts}
          onPromptClick={onSuggestedPromptClick || (() => {})}
          isVisible={showSuggestedPrompts}
          variant="input"
        />
      )}
      
      <div className="p-4">
        <div className={`bg-[#1a1a1a] border border-gray-700 rounded-[20px] relative overflow-hidden transition-all duration-500 ${
          isChatBlocked ? 'opacity-50' : ''
        } ${showGlow ? 'shadow-[0_0_20px_rgba(236,72,153,0.5)] border-pink-400/50' : ''}`}>
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
                box-shadow: 0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(236, 72, 153, 0.1);
              }
              100% {
                box-shadow: 0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(236, 72, 153, 0.2);
              }
            }
          `}</style>
          <form onSubmit={handleSubmit}>
            <div className="p-4 pb-0">
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
                  onRemoveFile={handleRemoveFile}
                  onFilePreview={handleFilePreview}
                />
              </div>
              
              <textarea
                ref={textareaRef}
                placeholder={getPlaceholderText()}
                value={prompt}
                onChange={(e) => !isChatBlocked && setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={5000}
                disabled={isInputDisabled}
                className={`chat-textarea w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-none text-lg resize-none ${
                  isInputDisabled ? 'cursor-not-allowed' : ''
                }`}
                style={{
                  minHeight: '60px',
                  maxHeight: '150px',
                  height: calculateHeight(),
                  transition: 'height 0.1s ease-out'
                }}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-[#1a1a1a]/60 backdrop-blur-sm"></div>
              <div className="relative p-4 flex items-center justify-between">
                {/* Remove paperclip button - no attachment popover */}
                <div></div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.xlsx,.json"
                />

                <div className="flex items-center gap-2">
                  <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-transparent hover:bg-transparent text-gray-400 hover:text-white px-3 h-8 flex items-center gap-1 font-orbitron border-0 transition-all duration-200"
                        disabled={isChatBlocked}
                      >
                        <span className="text-xs">Kairo Beta</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    
                    <PopoverContent 
                      side="top"
                      align="start"
                      sideOffset={8}
                      className="p-0 shadow-xl"
                      style={{
                        borderRadius: '16px',
                        background: '#131313',
                        width: '320px',
                        border: 'none'
                      }}
                    >
                      <div className="py-4 px-0">
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-5 h-5" style={{ opacity: 0, pointerEvents: 'none' }}></div>
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm font-orbitron">Kairo Beta</div>
                                <div className="text-gray-400 text-xs mt-1">Smartest model</div>
                              </div>
                            </div>
                            <div 
                              className="w-12 h-6 rounded-full relative cursor-pointer transition-colors bg-gray-600 hover:bg-gray-500"
                              style={{ pointerEvents: 'none', opacity: 0.5 }}
                            >
                              <div className="w-5 h-5 rounded-full absolute top-0.5 translate-x-0.5 bg-white shadow-md"></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-700 h-px mx-6"></div>

                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <User className="w-5 h-5 text-gray-400" />
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm">Auto Mode</div>
                                <div className="text-gray-400 text-xs mt-1">Automatic responses</div>
                              </div>
                            </div>
                            <div 
                              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                                autoModeEnabled ? 'bg-white' : 'bg-gray-600 hover:bg-gray-500'
                              }`}
                              onClick={() => {
                                const newAutoModeState = !autoModeEnabled;
                                setAutoModeEnabled(newAutoModeState);
                                window.dispatchEvent(new CustomEvent('autoModeToggle', { 
                                  detail: { enabled: newAutoModeState } 
                                }));
                              }}
                            >
                              <div 
                                className={`w-5 h-5 rounded-full absolute top-0.5 transition-transform shadow-md ${
                                  autoModeEnabled 
                                    ? 'translate-x-6 bg-black' 
                                    : 'translate-x-0.5 bg-white'
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {canCancelTask && isTaskInProgress ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCancelTask}
                      className="bg-white hover:bg-gray-200 text-black rounded-full w-8 h-8 p-0"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-white hover:bg-gray-200 text-black rounded-full w-8 h-8 p-0"
                      disabled={!prompt.trim() || isInputDisabled}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
