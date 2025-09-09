
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Settings, Flag, Users, CreditCard, LogOut, User } from 'lucide-react';
import SettingsModal from '../settings/SettingsModal';

interface SidebarUserProfileProps {
  isOpen: boolean;
}

const SidebarUserProfile = ({ isOpen }: SidebarUserProfileProps) => {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleMenuItemClick = (label: string) => {
    if (label === 'Settings' || label === 'Profile') {
      setSettingsOpen(true);
      setOpen(false);
    } else {
      setOpen(false);
    }
  };

  const menuItems = [
    { icon: User, label: 'Profile' },
    { icon: Settings, label: 'Settings' },
    { icon: Flag, label: 'Report Issue' },
    { icon: Users, label: 'Community' },
    { icon: CreditCard, label: 'Upgrade plan' },
    { icon: LogOut, label: 'Sign Out' },
  ];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex justify-center transform transition-all duration-300 ease-out hover:scale-110">
            <Avatar className="h-8 w-8 ring-2 ring-white/20 hover:ring-white/60 transition-all duration-300 ease-out cursor-pointer hover:shadow-lg hover:shadow-white/20">
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </PopoverTrigger>
          
        <PopoverContent 
          side={isOpen ? "right" : "right"}
          align="end"
          sideOffset={8}
          className="p-0 shadow-xl"
          style={{
            borderRadius: '16px',
            background: '#1f1f1f',
            width: '180px',
            border: 'none'
          }}
        >
          <div className="py-2 px-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                onClick={() => handleMenuItemClick(item.label)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </>
  );
};

export default SidebarUserProfile;
