
import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

interface TxtPreviewModalProps {
  previewFile: File | null;
  onClose: () => void;
}

const TxtPreviewModal = ({ previewFile, onClose }: TxtPreviewModalProps) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (previewFile && previewFile.type === 'text/plain') {
      setIsVisible(true);
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string || '');
        setIsLoading(false);
      };
      reader.onerror = () => {
        setFileContent('Error reading file');
        setIsLoading(false);
      };
      reader.readAsText(previewFile);
    } else {
      setIsVisible(false);
    }
  }, [previewFile]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!previewFile || previewFile.type !== 'text/plain') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={handleClose}>
      <div 
        className={`fixed right-0 top-0 h-full bg-[#101010] border-l border-gray-700 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '700px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 
              className="text-white font-medium truncate cursor-pointer" 
              title={`${previewFile.name} - Size: ${(previewFile.size / 1024).toFixed(1)} KB`}
            >
              {previewFile.name}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4" style={{ height: 'calc(100% - 73px)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : (
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {fileContent || 'File is empty'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default TxtPreviewModal;
