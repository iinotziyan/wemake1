
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Link, Upload, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import RecentsPopover from './RecentsPopover';

interface AttachmentPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMenuItemClick: (label: string) => void;
}

const AttachmentPopover = ({ isOpen, onOpenChange, onMenuItemClick }: AttachmentPopoverProps) => {
  const [recentsOpen, setRecentsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attachmentHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preventCloseRef = useRef(false);
  
  const attachMenuItems = [
    { icon: Upload, label: 'Upload a file' },
    { icon: FileText, label: 'Add Text Content' },
    { icon: Clock, label: 'Recents' },
  ];

  useEffect(() => {
    const handleRecentFilesUpdate = () => {
      setRefreshKey(prev => prev + 1);
      // Prevent the attachment popover from closing when recent files are updated
      preventCloseRef.current = true;
      setTimeout(() => {
        preventCloseRef.current = false;
      }, 100);
    };

    window.addEventListener('recentFilesUpdated', handleRecentFilesUpdate);
    return () => {
      window.removeEventListener('recentFilesUpdated', handleRecentFilesUpdate);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (attachmentHoverTimeoutRef.current) {
        clearTimeout(attachmentHoverTimeoutRef.current);
      }
    };
  }, []);

  const handleRecentFileSelect = (file: File) => {
    // Add the file to the input by calling the parent's file handling
    const event = new Event('fileSelected');
    (event as any).file = file;
    window.dispatchEvent(event);
    
    // Close the recents popover but keep attachment popover open
    setRecentsOpen(false);
  };

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const clearAttachmentHoverTimeout = () => {
    if (attachmentHoverTimeoutRef.current) {
      clearTimeout(attachmentHoverTimeoutRef.current);
      attachmentHoverTimeoutRef.current = null;
    }
  };

  const handleRecentsHover = (isHovering: boolean) => {
    clearHoverTimeout();

    if (isHovering) {
      setRecentsOpen(true);
    } else {
      // Add a delay but store the timeout reference
      hoverTimeoutRef.current = setTimeout(() => {
        setRecentsOpen(false);
      }, 200);
    }
  };

  const handleRecentsOpenChange = (open: boolean) => {
    if (open) {
      clearHoverTimeout();
      setRecentsOpen(true);
    } else {
      // Add a small delay before closing
      hoverTimeoutRef.current = setTimeout(() => {
        setRecentsOpen(false);
      }, 150);
    }
  };

  const handleAttachmentPopoverOpenChange = (open: boolean) => {
    // Prevent closing if we're in the middle of a recent files operation
    if (!open && preventCloseRef.current) {
      return;
    }
    
    clearAttachmentHoverTimeout();
    
    if (open) {
      onOpenChange(true);
    } else {
      // Don't close immediately if recents is open
      if (recentsOpen) {
        attachmentHoverTimeoutRef.current = setTimeout(() => {
          if (!recentsOpen && !preventCloseRef.current) {
            onOpenChange(false);
          }
        }, 200);
      } else {
        onOpenChange(false);
      }
    }
  };

  // Effect to handle recents closing and attachment popover state
  useEffect(() => {
    if (!recentsOpen && attachmentHoverTimeoutRef.current && !preventCloseRef.current) {
      clearAttachmentHoverTimeout();
      onOpenChange(false);
    }
  }, [recentsOpen, onOpenChange]);

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleAttachmentPopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button" 
            size="sm"
            className="bg-transparent hover:bg-gray-800/50 text-white hover:text-white rounded-full w-8 h-8 p-0 border border-[rgb(65,65,65)]"
          >
            <Link className="w-4 h-4" />
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
          onMouseEnter={() => clearAttachmentHoverTimeout()}
          onMouseLeave={() => {
            if (!recentsOpen && !preventCloseRef.current) {
              handleAttachmentPopoverOpenChange(false);
            }
          }}
        >
          <div className="py-2 px-2">
            {attachMenuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616] relative"
                onClick={() => {
                  if (item.label !== 'Recents') {
                    onMenuItemClick(item.label);
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
  );
};

export default AttachmentPopover;
