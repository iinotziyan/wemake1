import { ChevronLeft, Plus } from 'lucide-react';
import { Button } from '../../ui/button';

interface FilesBarHeaderProps {
  onToggle: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FilesBarHeader = ({ onToggle, fileInputRef }: FilesBarHeaderProps) => {
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-4 border-b border-[#1C1C1C] flex items-center justify-between flex-shrink-0">
      <h2 className="text-lg font-semibold text-white">Files</h2>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleFileUpload}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-[#1C1C1C] p-2 transition-all duration-300 group"
        >
          <Plus className="w-4 h-4 group-hover:text-white" />
        </Button>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-[#1C1C1C] p-2 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
