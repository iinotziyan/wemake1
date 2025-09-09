
import React from 'react';
import { X } from 'lucide-react';

interface FilePreviewModalProps {
  previewFile: File | null;
  onClose: () => void;
}

const FilePreviewModal = ({ previewFile, onClose }: FilePreviewModalProps) => {
  if (!previewFile) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={URL.createObjectURL(previewFile)}
          alt={previewFile.name}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
        <div className="text-center mt-4">
          <p className="text-white text-lg font-medium">{previewFile.name}</p>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
