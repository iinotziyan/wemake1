
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarToggle = ({ isOpen, onToggle }: SidebarToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      variant="ghost"
      size="sm"
      className="p-2 hover:bg-[#2E2E30] active:bg-[#2E2E30] text-gray-400 hover:text-white active:text-white transition-all duration-300 ease-out hover:scale-110 hover:shadow-md hover:rounded-full active:rounded-full focus:rounded-full"
    >
      {isOpen ? (
        <ChevronsLeft className="w-4 h-4 transition-transform duration-300 ease-out" />
      ) : (
        <ChevronsRight className="w-4 h-4 transition-transform duration-300 ease-out" />
      )}
    </Button>
  );
};

export default SidebarToggle;
