
import React from 'react';
import { FileText, X } from 'lucide-react';

interface FileUploadDisplayProps {
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  onFilePreview: (file: File) => void;
}

const FileUploadDisplay = ({ uploadedFiles, onRemoveFile, onFilePreview }: FileUploadDisplayProps) => {
  if (uploadedFiles.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {uploadedFiles.map((file, index) => (
        <div
          key={index}
          className="bg-[#2a2a2a] border border-gray-600 rounded-lg px-3 py-2 flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a3a3a] transition-colors"
          onClick={() => onFilePreview(file)}
        >
          <FileText className="w-4 h-4 text-gray-400" />
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

export default FileUploadDisplay;
