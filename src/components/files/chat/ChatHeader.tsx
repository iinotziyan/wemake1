
import { X } from 'lucide-react';
import { Button } from '../../ui/button';

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-[#1C1C1C] flex items-center justify-between flex-shrink-0">
      <h3 className="text-lg font-semibold text-white">Chat</h3>
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white hover:bg-[#1C1C1C] p-2 transition-all duration-300"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
