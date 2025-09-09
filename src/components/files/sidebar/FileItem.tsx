
import { MoreVertical } from 'lucide-react';
import { Button } from '../../ui/button';
import { RecentFile } from '../../../services/fileService';
import { FileActions } from './FileActions';

interface FileItemProps {
  file: RecentFile;
  index: number;
  selectedFile: string | null;
  onFileSelect: (fileId: string | null) => void;
  onDeleteFile: (fileId: string) => void;
  formatFileSize: (bytes: number) => string;
  renderFilePreview: (file: RecentFile) => JSX.Element;
}

export const FileItem = ({ 
  file, 
  index, 
  selectedFile, 
  onFileSelect, 
  onDeleteFile, 
  formatFileSize, 
  renderFilePreview 
}: FileItemProps) => (
  <div
    className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#1C1C1C] ${
      selectedFile === file.id ? 'bg-[#1C1C1C] shadow-lg' : ''
    }`}
    onClick={() => onFileSelect(file.id)}
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="w-10 h-10 rounded bg-[#2a2a2a] flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
      {renderFilePreview(file)}
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate transition-colors duration-300">
        {file.name}
      </p>
      <p className="text-xs text-gray-400 transition-colors duration-300">
        {formatFileSize(file.size)}
      </p>
    </div>

    <FileActions file={file} onDeleteFile={onDeleteFile} onFileSelect={onFileSelect} />
  </div>
);
