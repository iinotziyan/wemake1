
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TextContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
}

const TextContentDialog = ({ isOpen, onClose, onSave }: TextContentDialogProps) => {
  const [textContent, setTextContent] = useState('');

  const handleSave = () => {
    if (textContent.trim()) {
      // Create a .txt file from the text content
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], 'text-content.txt', { type: 'text/plain' });
      onSave(file);
      setTextContent('');
      onClose();
    }
  };

  const handleClose = () => {
    setTextContent('');
    onClose();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Limit to 5000 characters
    if (value.length <= 5000) {
      setTextContent(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl w-full mx-auto bg-transparent border-none shadow-none p-0"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-6">
          <DialogHeader className="flex flex-row items-center justify-between mb-4 space-y-0">
            <DialogTitle className="text-white text-lg font-semibold">
              Add Text Content
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            <textarea
              placeholder="Enter your text content here..."
              value={textContent}
              onChange={handleTextChange}
              maxLength={5000}
              className="w-full h-64 bg-[#2a2a2a] border border-gray-600 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Close
              </Button>
              <Button
                onClick={handleSave}
                disabled={!textContent.trim()}
                className="bg-white text-black hover:bg-gray-200"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TextContentDialog;
