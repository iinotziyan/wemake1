import { useState, useEffect } from 'react';
import FilesBar from '../components/files/FilesBar';
import FilePreview from '../components/files/FilePreview';
import FileChatSection from '../components/files/FileChatSection';
import CreateBoxHandler from '../components/files/CreateBoxHandler';
import { getRecentFiles, saveRecentFile } from '../services/fileService';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

const Files = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isFilesBarOpen, setIsFilesBarOpen] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isTaskInProgress, setIsTaskInProgress] = useState(false);
  const [isFilesBarClosing, setIsFilesBarClosing] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);
  
  const files = getRecentFiles();
  const hasFiles = files.length > 0;

  // Listen for task state changes
  useEffect(() => {
    const handleTaskStateChange = (event: CustomEvent) => {
      setIsTaskInProgress(event.detail.inProgress);
    };

    window.addEventListener('setTaskInProgress', handleTaskStateChange as EventListener);
    
    return () => {
      window.removeEventListener('setTaskInProgress', handleTaskStateChange as EventListener);
    };
  }, []);

  // Handle page navigation cancellation - NEW FEATURE
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTaskInProgress) {
        console.log('Page navigation detected during task - cancelling');
        
        // Cancel the typing animation and task
        const cancelEvent = new CustomEvent('cancelTypingAnimation');
        window.dispatchEvent(cancelEvent);
        
        const cancelTaskEvent = new CustomEvent('cancelCurrentTask');
        window.dispatchEvent(cancelTaskEvent);
      }
    };

    // Listen for page navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Component cleanup (when Files component unmounts)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Cancel any ongoing tasks when leaving the Files page
      if (isTaskInProgress) {
        console.log('Files page unmounting with active task - cancelling');
        
        const cancelEvent = new CustomEvent('cancelTypingAnimation');
        window.dispatchEvent(cancelEvent);
        
        const cancelTaskEvent = new CustomEvent('cancelCurrentTask');
        window.dispatchEvent(cancelTaskEvent);
      }
    };
  }, [isTaskInProgress]);

  // Listen for file preview events from chat input
  useEffect(() => {
    const handleFilePreviewEvent = async (event: CustomEvent) => {
      const { file } = event.detail;
      
      // Save the file to recent files and get its ID
      const fileId = await saveRecentFile(file);
      
      // Select the file for preview if successfully saved
      if (fileId) {
        setSelectedFile(fileId);
      }
    };

    window.addEventListener('showFileInPreview', handleFilePreviewEvent as EventListener);
    
    return () => {
      window.removeEventListener('showFileInPreview', handleFilePreviewEvent as EventListener);
    };
  }, []);

  const handleFileSelect = (fileId: string) => {
    // Prevent file selection during task for current file
    if (isTaskInProgress && selectedFile === fileId) {
      return; // Allow staying on the same file
    }
    
    // Prevent switching to different files during task
    if (isTaskInProgress && selectedFile !== fileId) {
      const event = new CustomEvent('fileSelectionAttemptDuringTask');
      window.dispatchEvent(event);
      return;
    }
    
    setSelectedFile(fileId);
  };

  const handleFileCreated = (fileId: string) => {
    setSelectedFile(fileId);
  };

  const handleToggleFilesBar = () => {
    if (isFilesBarOpen) {
      setIsFilesBarClosing(true);
      setTimeout(() => {
        setIsFilesBarOpen(false);
        setIsFilesBarClosing(false);
      }, 300);
    } else {
      setIsFilesBarOpen(true);
    }
  };

  const handleToggleChat = () => {
    if (isChatVisible) {
      // ENHANCED: Check if there's a task in progress before closing chat
      if (isTaskInProgress) {
        console.log('Cancelling task due to chat section closing via toggle');
        
        // Cancel the typing animation first
        const cancelTypingEvent = new CustomEvent('cancelTypingAnimation');
        window.dispatchEvent(cancelTypingEvent);
        
        // Then cancel the task completely
        const cancelTaskEvent = new CustomEvent('cancelCurrentTask');
        window.dispatchEvent(cancelTaskEvent);
      }
      
      setIsChatClosing(true);
      setTimeout(() => {
        setIsChatVisible(false);
        setIsChatClosing(false);
      }, 300);
    } else {
      setIsChatVisible(true);
    }
  };

  return (
    <div className="flex h-screen bg-[#0b0b0b] text-white">
      {/* Files Bar */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFilesBarOpen && !isFilesBarClosing ? 'w-80 opacity-100' : 'w-0 opacity-0'
        }`}
        style={{
          transform: isFilesBarOpen && !isFilesBarClosing ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {(isFilesBarOpen || isFilesBarClosing) && (
          <FilesBar 
            isOpen={isFilesBarOpen && !isFilesBarClosing}
            onToggle={handleToggleFilesBar}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        )}
      </div>
      
      {/* File Preview and Chat Section or Create Box */}
      <div className="flex-1 flex">
        {!hasFiles ? (
          /* Show Create something new when no files exist */
          <CreateBoxHandler onFileCreated={handleFileCreated} />
        ) : !selectedFile ? (
          /* Show file preview without selection when files exist but none selected */
          <FilePreview 
            selectedFile={selectedFile} 
            isFilesBarOpen={isFilesBarOpen}
            onToggleFilesBar={handleToggleFilesBar}
            isChatVisible={isChatVisible && !isChatClosing}
            onToggleChat={handleToggleChat}
          />
        ) : hasFiles && (isChatVisible || isChatClosing) ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={70} minSize={30} className="resizable-panel">
              <FilePreview 
                selectedFile={selectedFile} 
                isFilesBarOpen={isFilesBarOpen}
                onToggleFilesBar={handleToggleFilesBar}
                isChatVisible={isChatVisible && !isChatClosing}
                onToggleChat={handleToggleChat}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel 
              defaultSize={30} 
              minSize={25} 
              className="resizable-panel"
              style={{
                transform: isChatVisible && !isChatClosing ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {(isChatVisible || isChatClosing) && (
                <FileChatSection 
                  selectedFile={selectedFile} 
                  onClose={() => setIsChatVisible(false)}
                />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <FilePreview 
            selectedFile={selectedFile} 
            isFilesBarOpen={isFilesBarOpen}
            onToggleFilesBar={handleToggleFilesBar}
            isChatVisible={isChatVisible && !isChatClosing}
            onToggleChat={handleToggleChat}
          />
        )}
      </div>
    </div>
  );
};

export default Files;
