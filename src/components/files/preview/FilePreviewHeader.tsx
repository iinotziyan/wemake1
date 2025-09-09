
import { ChevronRight, Edit3, Check, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/button';
import { FilePreviewActions } from './FilePreviewActions';
import { updateRecentFile } from '../../../services/fileService';

interface FilePreviewHeaderProps {
  isFilesBarOpen: boolean;
  onToggleFilesBar: () => void;
  file: any;
  hasFiles: boolean;
  isChatVisible: boolean;
  onToggleChat: () => void;
  onEditFile?: () => void;
  isEditing?: boolean;
}

export const FilePreviewHeader = ({ 
  isFilesBarOpen, 
  onToggleFilesBar, 
  file, 
  hasFiles, 
  isChatVisible, 
  onToggleChat,
  onEditFile,
  isEditing
}: FilePreviewHeaderProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setFileName(nameWithoutExtension);
    }
  }, [file]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleFileNameClick = () => {
    if (!isEditing) {
      setIsRenaming(true);
    }
  };

  const handleFileNameSave = async () => {
    if (!file || !fileName.trim()) {
      setIsRenaming(false);
      return;
    }

    try {
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${fileName.trim()}.${fileExtension}`;
      
      // Update the file name using the file service
      const success = updateRecentFile(file.id, { name: newFileName });
      
      if (success) {
        // Update the current file object
        file.name = newFileName;
        setIsRenaming(false);
      } else {
        console.error('Failed to update file name');
        setIsRenaming(false);
      }
    } catch (error) {
      console.error('Error renaming file:', error);
      setIsRenaming(false);
    }
  };

  const handleFileNameCancel = () => {
    if (file) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setFileName(nameWithoutExtension);
    }
    setIsRenaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFileNameSave();
    } else if (e.key === 'Escape') {
      handleFileNameCancel();
    }
  };

  const getFileExtension = () => {
    return file ? `.${file.name.split('.').pop()}` : '';
  };

  return (
    <div className="p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {!isFilesBarOpen && (
          <Button
            onClick={onToggleFilesBar}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#1C1C1C] p-2 transition-all duration-300 group"
          >
            <ChevronRight className="w-4 h-4 group-hover:text-white" />
          </Button>
        )}
        {hasFiles && (
          <div className="flex items-center gap-3">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent text-white text-lg font-semibold border-b border-gray-500 focus:border-white outline-none"
                />
                <span className="text-lg font-semibold text-gray-400">{getFileExtension()}</span>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={handleFileNameSave}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleFileNameCancel}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <h3 
                className="text-lg font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                onClick={handleFileNameClick}
              >
                {file ? file.name : 'File Preview'}
              </h3>
            )}
          </div>
        )}
      </div>
      
      {/* Fix 2: Hide FilePreviewActions when renaming */}
      {!isRenaming && (
        <FilePreviewActions 
          file={file} 
          isChatVisible={isChatVisible} 
          onToggleChat={onToggleChat}
          onEditFile={onEditFile}
          isEditing={isEditing}
          isRenaming={isRenaming}
        />
      )}
    </div>
  );
};
