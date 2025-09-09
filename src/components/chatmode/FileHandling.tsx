import { useRef, useEffect } from 'react';
import { saveRecentFile } from '@/services/fileService';

export interface FileHandlingProps {
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setPreviewFile: React.Dispatch<React.SetStateAction<File | null>>;
  setTxtPreviewFile: React.Dispatch<React.SetStateAction<File | null>>;
  setAttachPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTextContentDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useFileHandling = ({
  uploadedFiles,
  setUploadedFiles,
  setPreviewFile,
  setTxtPreviewFile,
  setAttachPopoverOpen,
  setTextContentDialogOpen,
}: FileHandlingProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFileSelected = (event: Event) => {
      const file = (event as any).file;
      if (file) {
        // Add the file to uploaded files
        setUploadedFiles(prev => [...prev, file]);
        console.log('File selected from recents:', file);
      }
    };

    window.addEventListener('fileSelected', handleFileSelected);
    return () => {
      window.removeEventListener('fileSelected', handleFileSelected);
    };
  }, [setUploadedFiles]);

  const serializeFileData = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (file.type === 'text/plain') {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            content: reader.result as string
          });
        } else {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            dataUrl: reader.result as string
          });
        }
      };
      
      reader.onerror = reject;
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setAttachPopoverOpen(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      // Increased limit to 35 files to support 30+ files
      if (uploadedFiles.length + fileArray.length > 35) {
        alert('You can only upload a maximum of 35 files.');
        return;
      }
      
      const maxSize = 100 * 1024 * 1024;
      const oversizedFiles = fileArray.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        alert('Some files are larger than 100MB. Please select smaller files.');
        return;
      }
      
      setUploadedFiles(prev => [...prev, ...fileArray]);
      
      // Save each file to recent files
      for (const file of fileArray) {
        await saveRecentFile(file);
      }
      
      console.log('Selected files:', files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      setPreviewFile(file);
      setTxtPreviewFile(null);
    } else if (file.type === 'text/plain') {
      setTxtPreviewFile(file);
      setPreviewFile(null);
    }
  };

  const handleAttachMenuClick = (label: string) => {
    if (label === 'Upload a file') {
      handleFileUpload();
    } else if (label === 'Add Text Content') {
      setTextContentDialogOpen(true);
      setAttachPopoverOpen(false);
    } else {
      console.log(`Clicked: ${label}`);
      setAttachPopoverOpen(false);
    }
  };

  const handleTextContentSave = async (file: File) => {
    setUploadedFiles(prev => [...prev, file]);
    // Save text content file to recent files
    await saveRecentFile(file);
  };

  return {
    fileInputRef,
    serializeFileData,
    handleFileUpload,
    handleFileChange,
    handleRemoveFile,
    handleFilePreview,
    handleAttachMenuClick,
    handleTextContentSave,
  };
};
