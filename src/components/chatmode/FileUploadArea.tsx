
import React from 'react';
import { FileText, X } from 'lucide-react';

interface FileUploadAreaProps {
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  onFilePreview: (file: File) => void;
}

const FileUploadArea = ({ uploadedFiles, onRemoveFile, onFilePreview }: FileUploadAreaProps) => {
  if (uploadedFiles.length === 0) return null;

  const handleFileClick = (file: File) => {
    // Dispatch custom event to show file in preview section
    const event = new CustomEvent('showFileInPreview', { detail: { file } });
    window.dispatchEvent(event);
    
    // Also call the existing preview handler
    onFilePreview(file);
  };

  return (
    <div className="mb-3 flex flex-wrap gap-2 hide-scrollbar" style={{
      maxHeight: '120px',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {uploadedFiles.map((file, index) => (
        <div
          key={index}
          className="bg-[#2a2a2a] border border-gray-600 rounded-lg px-3 py-2 flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a3a3a] transition-colors"
          onClick={() => handleFileClick(file)}
        >
          {file.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-4 h-4 object-cover rounded"
            />
          ) : (
            <FileText className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-gray-300 truncate max-w-[200px]">{file.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFile(index);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileUploadArea;
