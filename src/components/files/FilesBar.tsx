
import { useState, useRef, useEffect } from 'react';
import CustomSlider from '../sidebar/CustomSlider';
import { getRecentFiles, saveRecentFile, removeRecentFile, RecentFile } from '../../services/fileService';
import { FilesBarHeader } from './sidebar/FilesBarHeader';
import { FileItem } from './sidebar/FileItem';

interface FilesBarProps {
  isOpen: boolean;
  onToggle: () => void;
  onFileSelect: (fileId: string | null) => void;
  selectedFile: string | null;
}

const FilesBar = ({ isOpen, onToggle, onFileSelect, selectedFile }: FilesBarProps) => {
  const [files, setFiles] = useState<RecentFile[]>(getRecentFiles());
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Listen for file updates
  useEffect(() => {
    const handleFileUpdate = () => {
      setFiles(getRecentFiles());
    };

    window.addEventListener('recentFilesUpdated', handleFileUpdate);
    
    return () => {
      window.removeEventListener('recentFilesUpdated', handleFileUpdate);
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      for (let i = 0; i < uploadedFiles.length; i++) {
        await saveRecentFile(uploadedFiles[i]);
      }
      setFiles(getRecentFiles());
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    removeRecentFile(fileId);
    setFiles(getRecentFiles());
    if (selectedFile === fileId) {
      onFileSelect(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('text')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFilePreview = (file: RecentFile) => {
    if (file.type.startsWith('image/') && file.dataUrl) {
      return (
        <img
          src={file.dataUrl}
          alt={file.name}
          className="w-full h-full object-cover rounded transition-transform duration-300 hover:scale-110"
        />
      );
    }

    const iconBgColors = {
      video: 'bg-gray-800 hover:bg-gray-700',
      audio: 'bg-gray-800 hover:bg-gray-700',
      pdf: 'bg-red-900 hover:bg-red-800',
      text: 'bg-blue-900 hover:bg-blue-800',
      default: 'bg-gray-800 hover:bg-gray-700'
    };

    let bgColor = iconBgColors.default;
    if (file.type.startsWith('video/')) bgColor = iconBgColors.video;
    else if (file.type.startsWith('audio/')) bgColor = iconBgColors.audio;
    else if (file.type.includes('pdf')) bgColor = iconBgColors.pdf;
    else if (file.type.includes('text')) bgColor = iconBgColors.text;

    return (
      <div className={`w-full h-full ${bgColor} rounded flex items-center justify-center transition-colors duration-300`}>
        <span className="text-2xl">{getFileIcon(file.type)}</span>
      </div>
    );
  };

  return (
    <div 
      className={`w-80 bg-[#0f0f0f] border-r border-[#1C1C1C] flex flex-col transition-all duration-300 ease-out ${
        isVisible ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-full opacity-0'
      }`}
      style={{ height: '100vh' }}
    >
      <FilesBarHeader onToggle={onToggle} fileInputRef={fileInputRef} />
      
      <CustomSlider isOpen={true} className="flex-1">
        <div className="p-2 space-y-1">
          {files.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400 text-sm">No files yet</p>
            </div>
          ) : (
            files.map((file, index) => (
              <FileItem
                key={file.id}
                file={file}
                index={index}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                onDeleteFile={handleDeleteFile}
                formatFileSize={formatFileSize}
                renderFilePreview={renderFilePreview}
              />
            ))
          )}
        </div>
      </CustomSlider>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default FilesBar;
