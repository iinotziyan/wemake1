
import { useState, useEffect } from 'react';
import { getRecentFiles } from '../../services/fileService';
import CreateBoxHandler from './CreateBoxHandler';
import { FilePreviewHeader } from './preview/FilePreviewHeader';
import { FileRenderer } from './preview/FileRenderer';

interface FilePreviewProps {
  selectedFile: string | null;
  isFilesBarOpen: boolean;
  onToggleFilesBar: () => void;
  isChatVisible: boolean;
  onToggleChat: () => void;
}

const FilePreview = ({ 
  selectedFile, 
  isFilesBarOpen, 
  onToggleFilesBar, 
  isChatVisible, 
  onToggleChat 
}: FilePreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const files = getRecentFiles();
  const file = selectedFile ? files.find(f => f.id === selectedFile) : null;
  const hasFiles = files.length > 0;

  // Auto-start editing for new untitled markdown files
  useEffect(() => {
    if (file && file.name === 'untitled.md' && !isEditing) {
      setIsEditing(true);
    }
  }, [file, isEditing]);

  const handleFileCreated = (fileId: string) => {
    window.location.reload();
  };

  const handleEditFile = () => {
    setIsEditing(true);
  };

  const handleEditEnd = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex-1 bg-[#0b0b0b] flex flex-col h-full">
      <FilePreviewHeader 
        isFilesBarOpen={isFilesBarOpen}
        onToggleFilesBar={onToggleFilesBar}
        file={file}
        hasFiles={hasFiles}
        isChatVisible={isChatVisible}
        onToggleChat={onToggleChat}
        onEditFile={handleEditFile}
        isEditing={isEditing}
      />
      
      <FilePreviewContent 
        hasFiles={hasFiles}
        file={file}
        isChatVisible={isChatVisible}
        onFileCreated={handleFileCreated}
        isEditing={isEditing}
        onEditEnd={handleEditEnd}
      />
    </div>
  );
};

const FilePreviewContent = ({ 
  hasFiles, 
  file, 
  isChatVisible, 
  onFileCreated,
  isEditing,
  onEditEnd
}: {
  hasFiles: boolean;
  file: any;
  isChatVisible: boolean;
  onFileCreated: (fileId: string) => void;
  isEditing: boolean;
  onEditEnd: () => void;
}) => {
  if (!hasFiles) {
    return (
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <CreateBoxHandler onFileCreated={onFileCreated} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center overflow-auto">
      <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
        <FileRenderer 
          file={file} 
          isChatVisible={isChatVisible} 
          isEditing={isEditing}
          onEditEnd={onEditEnd}
        />
      </div>
    </div>
  );
};

export default FilePreview;
