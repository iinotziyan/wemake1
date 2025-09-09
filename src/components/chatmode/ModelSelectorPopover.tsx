
import React, { useState } from 'react';
import { ChevronDown, Settings, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface ModelSelectorPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMenuItemClick: (label: string) => void;
}

const ModelSelectorPopover = ({
  isOpen,
  onOpenChange,
  onMenuItemClick
}: ModelSelectorPopoverProps) => {
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);

  const handleAutoModeToggle = () => {
    setAutoModeEnabled(!autoModeEnabled);
    // Dispatch event to notify other components about auto mode change
    window.dispatchEvent(new CustomEvent('autoModeToggle', { 
      detail: { enabled: !autoModeEnabled } 
    }));
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="bg-transparent hover:bg-[#303032] text-white hover:text-white px-3 h-8 flex items-center gap-1 font-orbitron border-0 transition-all duration-200 hover:rounded-[18px]"
        >
          <span className="text-xs">Kairo Beta</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="top"
        align="start"
        sideOffset={8}
        className="p-0 shadow-xl"
        style={{
          borderRadius: '16px',
          background: '#131313',
          width: '320px',
          border: 'none'
        }}
      >
        <div className="py-4 px-0">
          {/* Kairo Beta Section */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Settings className="w-5 h-5 text-gray-400" style={{ opacity: 0, pointerEvents: 'none' }} />
                <div className="flex-1">
                  <div className="text-white font-medium text-sm font-orbitron">Kairo Beta</div>
                  <div className="text-gray-400 text-xs mt-1">Smartest</div>
                </div>
              </div>
              <div 
                className="w-12 h-6 rounded-full relative cursor-pointer transition-colors bg-gray-600 hover:bg-gray-500"
                style={{ pointerEvents: 'none', opacity: 0.5 }}
              >
                <div className="w-5 h-5 rounded-full absolute top-0.5 translate-x-0.5 bg-white shadow-md"></div>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" style={{ width: '270px', margin: '0 auto' }} />

          {/* Auto Mode Section */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">Auto Mode</div>
                  <div className="text-gray-400 text-xs mt-1">Automatic responses</div>
                </div>
              </div>
              <div 
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                  autoModeEnabled ? 'bg-white' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                onClick={handleAutoModeToggle}
              >
                <div 
                  className={`w-5 h-5 rounded-full absolute top-0.5 transition-transform shadow-md ${
                    autoModeEnabled 
                      ? 'translate-x-6 bg-black' 
                      : 'translate-x-0.5 bg-white'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ModelSelectorPopover;
