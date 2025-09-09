
import { Download, Trash2, Share, MessageSquare, Edit3, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { removeRecentFile } from '../../../services/fileService';

interface FilePreviewActionsProps {
  file: any;
  isChatVisible: boolean;
  onToggleChat: () => void;
  onEditFile?: () => void;
  isEditing?: boolean;
  isRenaming?: boolean;
  onFileNameSave?: () => void;
  onFileNameCancel?: () => void;
}

export const FilePreviewActions = ({ 
  file, 
  isChatVisible, 
  onToggleChat,
  onEditFile,
  isEditing,
  isRenaming,
  onFileNameSave,
  onFileNameCancel
}: FilePreviewActionsProps) => {
  const [isEditDisabled, setIsEditDisabled] = useState(false);

  // Listen for edit button state changes from chat
  useEffect(() => {
    const handleEditButtonState = (event: CustomEvent) => {
      const { disabled } = event.detail;
      setIsEditDisabled(disabled);
    };

    window.addEventListener('setEditButtonDisabled', handleEditButtonState as EventListener);
    
    return () => {
      window.removeEventListener('setEditButtonDisabled', handleEditButtonState as EventListener);
    };
  }, []);

  const handleDownload = () => {
    if (file?.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      link.click();
    } else if (file?.content) {
      // For text files, create a blob and download
      const blob = new Blob([file.content], { type: file.type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = () => {
    if (file?.id) {
      removeRecentFile(file.id);
      // Trigger a page refresh to update the UI
      window.location.reload();
    }
  };

  const handleShare = () => {
    if (file?.dataUrl) {
      navigator.clipboard.writeText(file.dataUrl).then(() => {
        console.log('File link copied to clipboard');
      }).catch(() => {
        console.log('Failed to copy link');
      });
    } else if (file?.content) {
      navigator.clipboard.writeText(file.content).then(() => {
        console.log('File content copied to clipboard');
      }).catch(() => {
        console.log('Failed to copy content');
      });
    }
  };

  if (!file) return null;

  // Show rename controls when renaming
  if (isRenaming) {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={onFileNameSave}
          className="text-gray-400 hover:text-white transition-colors duration-300"
          title="Save"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={onFileNameCancel}
          className="text-gray-400 hover:text-white transition-colors duration-300"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Show editing controls when editing file content
  if (isEditing) {
    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            // This will be handled by the FileRenderer component
            const event = new CustomEvent('saveFileEdit');
            window.dispatchEvent(event);
          }}
          className="text-gray-400 hover:text-white transition-colors duration-300"
          title="Save"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            // This will be handled by the FileRenderer component
            const event = new CustomEvent('cancelFileEdit');
            window.dispatchEvent(event);
          }}
          className="text-gray-400 hover:text-white transition-colors duration-300"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleDownload}
        className="text-white hover:text-gray-300 transition-colors duration-300"
        title="Download"
      >
        <Download className="w-5 h-5" />
      </button>
      <button
        onClick={handleDelete}
        className="text-white hover:text-red-400 transition-colors duration-300"
        title="Delete"
      >
        <Trash2 className="w-5 h-5" />
      </button>
      <button
        onClick={handleShare}
        className="text-white hover:text-gray-300 transition-colors duration-300"
        title="Share"
      >
        <Share className="w-5 h-5" />
      </button>
      
      {/* Edit button for text and markdown files */}
      {(file.type === 'text/plain' || file.type === 'text/markdown') && onEditFile && (
        <button
          onClick={onEditFile}
          disabled={isEditDisabled}
          className={`transition-colors duration-300 ${
            isEditDisabled 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'text-white hover:text-gray-300'
          }`}
          title={isEditDisabled ? "Cannot edit while AI is processing" : "Edit file"}
        >
          <Edit3 className="w-5 h-5" />
        </button>
      )}
      
      {!isChatVisible && (
        <button
          onClick={onToggleChat}
          className="text-white hover:text-gray-300 transition-colors duration-300"
          title="Open Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
