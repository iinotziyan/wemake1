
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface SidebarSearchProps {
  isOpen: boolean;
}

const SidebarSearch = ({ isOpen }: SidebarSearchProps) => {
  return (
    <div className={`p-4 ${!isOpen ? 'mt-4' : ''}`}>
      <div className="relative">
        <Search className={`
            absolute text-white transition-all duration-300
            ${!isOpen 
              ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#414141] bg-[#1b1b1b] rounded-full p-2 w-8 h-8' 
              : 'left-3 top-1/2 -translate-y-1/2 w-5 h-5'
            }
          `} />
        {isOpen && (
          <Input
            type="text"
            placeholder="CTRL+K"
            className="
              bg-[#1b1b1b] border border-[#414141] text-white placeholder-gray-400 pl-12 h-10
              hover:bg-[#252525]
              focus:border-[#414141] focus:bg-[#252525]
              rounded-[30px] transition-all duration-300
            "
          />
        )}
      </div>
    </div>
  );
};

export default SidebarSearch;
