
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Paperclip, ChevronDown, Settings, Zap, FileText, Upload, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import FileUploadDisplay from './FileUploadDisplay';
import RecentsPopover from '../chatmode/RecentsPopover';

interface ChatInputSectionProps {
  prompt: string;
  uploadedFiles: File[];
  attachPopoverOpen: boolean;
  modelPopoverOpen: boolean;
  customInstructionEnabled: boolean;
  searchEnabled: boolean;
  isLoading: boolean;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onRemoveFile: (index: number) => void;
  onFilePreview: (file: File) => void;
  onAttachPopoverChange: (open: boolean) => void;
  onModelPopoverChange: (open: boolean) => void;
  onAttachMenuClick: (label: string) => void;
  onCustomInstructionToggle: () => void;
  onSearchToggle: () => void;
  attachMenuItems: Array<{ icon: any; label: string }>;
}

const ChatInputSection = ({
  prompt,
  uploadedFiles,
  attachPopoverOpen,
  modelPopoverOpen,
  customInstructionEnabled,
  searchEnabled,
  isLoading,
  onPromptChange,
  onSubmit,
  onKeyDown,
  onRemoveFile,
  onFilePreview,
  onAttachPopoverChange,
  onModelPopoverChange,
  onAttachMenuClick,
  onCustomInstructionToggle,
  onSearchToggle,
  attachMenuItems,
}: ChatInputSectionProps) => {
  const [recentsOpen, setRecentsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleRecentFilesUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleFileSelected = (event: Event) => {
      const file = (event as any).file;
      if (file) {
        // Close the recents popover
        setRecentsOpen(false);
        console.log('File selected from recents in chat:', file);
      }
    };

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

    window.addEventListener('recentFilesUpdated', handleRecentFilesUpdate);
    window.addEventListener('fileSelected', handleFileSelected);
    window.addEventListener('autoModeToggle', handleAutoModeToggle as EventListener);
    
    return () => {
      window.removeEventListener('recentFilesUpdated', handleRecentFilesUpdate);
      window.removeEventListener('fileSelected', handleFileSelected);
      window.removeEventListener('autoModeToggle', handleAutoModeToggle as EventListener);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleRecentsHover = (isHovering: boolean) => {
    clearHoverTimeout();

    if (isHovering) {
      setRecentsOpen(true);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setRecentsOpen(false);
      }, 150);
    }
  };

  const handleRecentsOpenChange = (open: boolean) => {
    if (open) {
      clearHoverTimeout();
      setRecentsOpen(true);
    } else {
      setRecentsOpen(false);
    }
  };

  const handleRecentFileSelect = (file: File) => {
    // Add the file to the input by calling the parent's file handling
    const event = new Event('fileSelected');
    (event as any).file = file;
    window.dispatchEvent(event);
    
    // Close the recents popover
    setRecentsOpen(false);
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className={`bg-[#1a1a1a] border border-gray-700 rounded-2xl relative overflow-hidden transition-all duration-500 ${
          showGlow ? 'shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(0,191,255,0.4)] border-white/30' : ''
        }`}>
          <style>{`
            .chat-textarea {
              scrollbar-width: thin;
              scrollbar-color: rgb(15 15 15) transparent;
            }
            
            .chat-textarea::-webkit-scrollbar {
              width: 6px;
            }
            
            .chat-textarea::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .chat-textarea::-webkit-scrollbar-thumb {
              background-color: rgb(15 15 15);
              border-radius: 3px;
              border: none;
              transition: background-color 0.15s ease-in-out;
            }
            
            .chat-textarea::-webkit-scrollbar-thumb:hover {
              background-color: rgb(38 38 38);
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
            <div className="p-4 pb-0">
              <FileUploadDisplay
                uploadedFiles={uploadedFiles}
                onRemoveFile={onRemoveFile}
                onFilePreview={onFilePreview}
              />
              
              <textarea
                placeholder="Type your message..."
                value={prompt}
                onChange={onPromptChange}
                onKeyDown={onKeyDown}
                maxLength={5000}
                disabled={isLoading}
                className="chat-textarea w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-none text-sm resize-none disabled:opacity-50"
                style={{
                  minHeight: '50px',
                  maxHeight: '150px',
                  height: '50px',
                }}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-[#1a1a1a]/60 backdrop-blur-sm"></div>
              <div className="relative p-4 flex items-center justify-between">
                <>
                  <Popover open={attachPopoverOpen} onOpenChange={onAttachPopoverChange}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isLoading}
                        className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white rounded-full w-8 h-8 p-0 border border-gray-600 disabled:opacity-50"
                      >
                        <Paperclip className="w-4 h-4" />
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
                        width: '180px',
                        border: 'none'
                      }}
                    >
                      <div className="py-2 px-2">
                        {attachMenuItems.map((item, index) => (
                          <button
                            key={index}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616] relative"
                            onClick={() => {
                              if (item.label !== 'Recents') {
                                onAttachMenuClick(item.label);
                              }
                            }}
                            onMouseEnter={() => {
                              if (item.label === 'Recents') {
                                handleRecentsHover(true);
                              }
                            }}
                            onMouseLeave={() => {
                              if (item.label === 'Recents') {
                                handleRecentsHover(false);
                              }
                            }}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <RecentsPopover
                    key={refreshKey}
                    isOpen={recentsOpen}
                    onOpenChange={handleRecentsOpenChange}
                    onFileSelect={handleRecentFileSelect}
                    attachmentPopoverElement={document.querySelector('[data-radix-popper-content-wrapper]')}
                  />
                </>

                <div className="flex items-center gap-2">
                  <Popover open={modelPopoverOpen} onOpenChange={onModelPopoverChange}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-transparent hover:bg-transparent text-gray-400 hover:text-white px-3 h-8 flex items-center gap-1 font-orbitron border-0 transition-all duration-200"
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
                              <Settings className="w-5 h-5 text-gray-400" style={{ opacity: 0, pointerEvents: 'none' }} />
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm font-orbitron">Kairo Beta</div>
                                <div className="text-gray-400 text-xs mt-1">Smartest</div>
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

                        <Separator className="bg-gray-700" style={{ width: '270px', margin: '0 auto' }} />

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
                                customInstructionEnabled ? 'bg-white' : 'bg-gray-600 hover:bg-gray-500'
                              }`}
                              onClick={() => {
                                onCustomInstructionToggle();
                                // Dispatch event for glow effect
                                window.dispatchEvent(new CustomEvent('autoModeToggle', { 
                                  detail: { enabled: !customInstructionEnabled } 
                                }));
                              }}
                            >
                              <div 
                                className={`w-5 h-5 rounded-full absolute top-0.5 transition-transform shadow-md ${
                                  customInstructionEnabled 
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

                  <Button
                    type="submit"
                    size="sm"
                    className="bg-white hover:bg-gray-200 text-black rounded-full w-8 h-8 p-0"
                    disabled={!prompt.trim() || isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInputSection;
