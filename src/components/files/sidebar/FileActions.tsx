import { MoreVertical, Share, Download, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { RecentFile } from '../../../services/fileService';

interface FileActionsProps {
  file: RecentFile;
  onDeleteFile: (fileId: string) => void;
  onFileSelect: (fileId: string | null) => void;
}

export const FileActions = ({ 
  file, 
  onDeleteFile, 
  onFileSelect 
}: FileActionsProps) => {
  const handleShare = () => {
    // Create a shareable link or copy file content to clipboard
    if (file.dataUrl) {
      // For files with dataUrl, create a temporary link
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      
      // Copy the link to clipboard
      navigator.clipboard.writeText(file.dataUrl).then(() => {
        console.log('File link copied to clipboard');
      }).catch(() => {
        console.log('Failed to copy link');
      });
    } else if (file.content) {
      // For text files, copy content to clipboard
      navigator.clipboard.writeText(file.content).then(() => {
        console.log('File content copied to clipboard');
      }).catch(() => {
        console.log('Failed to copy content');
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 text-white hover:bg-[#333] p-1 transition-all duration-300"
        >
          <MoreVertical className="w-4 h-4 group-hover:text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-48 p-0 shadow-xl border-none"
        style={{
          borderRadius: '16px',
          background: '#131313',
        }}
      >
        <div className="py-2">
          <DropdownMenuItem
            onClick={handleShare}
            className="flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 mx-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616] cursor-pointer"
          >
            <Share className="w-4 h-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (file.dataUrl) {
                const link = document.createElement('a');
                link.href = file.dataUrl;
                link.download = file.name;
                link.click();
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 mx-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 mx-2 bg-[#3b3a3a]" />
          <DropdownMenuItem
            onClick={() => onDeleteFile(file.id)}
            className="flex items-center gap-3 px-3 py-2.5 text-left text-red-400 transition-all text-sm my-1 mx-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616] cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
