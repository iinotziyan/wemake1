import React, { useEffect, useRef, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getRecentFiles, removeRecentFile, RecentFile } from '@/services/fileService';

interface RecentsPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (file: File) => void;
  attachmentPopoverElement?: Element | null;
}

const RecentsPopover = ({ isOpen, onOpenChange, onFileSelect, attachmentPopoverElement }: RecentsPopoverProps) => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Update recent files when component mounts or when files are updated
  useEffect(() => {
    const updateRecentFiles = () => {
      setRecentFiles(getRecentFiles());
    };

    updateRecentFiles();

    const handleRecentFilesUpdate = () => {
      updateRecentFiles();
    };

    window.addEventListener('recentFilesUpdated', handleRecentFilesUpdate);
    
    return () => {
      window.removeEventListener('recentFilesUpdated', handleRecentFilesUpdate);
    };
  }, []);

  useEffect(() => {
    if (isOpen && popoverRef.current) {
      const popoverElement = popoverRef.current;
      
      // Calculate dynamic height based on content
      const baseHeight = 60; // header padding
      const itemHeight = 56; // approximate height per file item
      const emptyStateHeight = 60; // height for "No recent files" message
      
      let calculatedHeight;
      if (recentFiles.length === 0) {
        calculatedHeight = baseHeight + emptyStateHeight;
      } else {
        calculatedHeight = baseHeight + (recentFiles.length * itemHeight);
      }
      
      // Set maximum height to 900px
      const maxHeight = 900;
      const finalHeight = Math.min(calculatedHeight, maxHeight);
      
      // Try to find the attachment popover element
      let attachmentRect;
      if (attachmentPopoverElement) {
        attachmentRect = attachmentPopoverElement.getBoundingClientRect();
      } else {
        // Fallback: look for any radix popover content or attachment button
        const fallbackElement = document.querySelector('[data-radix-popper-content-wrapper]') || 
                               document.querySelector('button[aria-label*="attach"]') ||
                               document.querySelector('button svg[class*="paperclip"]')?.closest('button');
        
        if (fallbackElement) {
          attachmentRect = fallbackElement.getBoundingClientRect();
        } else {
          // Final fallback: center on screen
          attachmentRect = {
            right: window.innerWidth / 2,
            top: window.innerHeight / 2,
            left: window.innerWidth / 2 - 90, // half of popover width
            bottom: window.innerHeight / 2
          };
        }
      }
      
      const viewportHeight = window.innerHeight;
      
      // Position to the right of the attachment popover
      const leftPosition = attachmentRect.right + 8;
      let topPosition = attachmentRect.top - finalHeight - 8;
      
      // Ensure it doesn't go above viewport
      if (topPosition < 8) {
        topPosition = 8;
      }
      
      // Ensure it doesn't exceed viewport height
      const availableHeight = Math.min(finalHeight, viewportHeight - topPosition - 16);
      
      // Ensure it doesn't go off the right edge of the screen
      const maxLeftPosition = window.innerWidth - 280 - 16; // 280px width + 16px margin
      const finalLeftPosition = Math.min(leftPosition, maxLeftPosition);
      
      popoverElement.style.position = 'fixed';
      popoverElement.style.left = `${finalLeftPosition}px`;
      popoverElement.style.top = `${topPosition}px`;
      popoverElement.style.height = `${availableHeight}px`;
      popoverElement.style.zIndex = '9999';
    }
  }, [isOpen, attachmentPopoverElement, recentFiles.length]);

  const handleFileClick = async (recentFile: RecentFile) => {
    try {
      let file: File;
      
      if (recentFile.type === 'text/plain' && recentFile.content) {
        // For text files, create from content
        const blob = new Blob([recentFile.content], { type: recentFile.type });
        file = new File([blob], recentFile.name, {
          type: recentFile.type,
          lastModified: recentFile.lastModified,
        });
      } else if (recentFile.dataUrl) {
        // For other files, convert from dataUrl back to File
        const response = await fetch(recentFile.dataUrl);
        const blob = await response.blob();
        file = new File([blob], recentFile.name, {
          type: recentFile.type,
          lastModified: recentFile.lastModified,
        });
      } else {
        console.error('Invalid recent file data:', recentFile);
        return;
      }
      
      console.log('Successfully reconstructed file:', file);
      onFileSelect(file);
      onOpenChange(false);
    } catch (error) {
      console.error('Error reconstructing file from recent data:', error);
    }
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    removeRecentFile(fileId);
    setRecentFiles(getRecentFiles());
    window.dispatchEvent(new CustomEvent('recentFilesUpdated'));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return null;
    }
    return <FileText className="w-6 h-6 text-gray-400" />;
  };

  const getFilePreview = (file: RecentFile) => {
    if (file.type.startsWith('image/') && file.dataUrl) {
      return (
        <img
          src={file.dataUrl}
          alt={file.name}
          className="w-6 h-6 object-cover rounded"
        />
      );
    }
    return getFileIcon(file.type);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="p-0 shadow-xl overflow-hidden"
      style={{
        borderRadius: '16px',
        background: '#131313',
        width: '280px',
        border: 'none',
        position: 'fixed',
        zIndex: 9999,
      }}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
    >
      <div className="py-3 px-3 h-full flex flex-col">
        <div className="text-white font-medium text-sm mb-3 px-1 flex-shrink-0">Recent Files</div>
        
        {recentFiles.length === 0 ? (
          <div className="text-gray-400 text-sm px-3 py-4 text-center">
            No recent files
          </div>
        ) : recentFiles.length * 56 + 60 <= 900 ? (
          <div className="space-y-2 pr-2">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161616] cursor-pointer group transition-colors"
                onClick={() => handleFileClick(file)}
              >
                <div className="w-8 h-8 rounded bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                  {getFilePreview(file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{file.name}</div>
                </div>
                
                <button
                  onClick={(e) => handleDeleteFile(file.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-2 pr-2">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161616] cursor-pointer group transition-colors"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="w-8 h-8 rounded bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    {getFilePreview(file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{file.name}</div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteFile(file.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default RecentsPopover;
