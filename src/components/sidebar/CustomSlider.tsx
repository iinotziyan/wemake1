
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface CustomSliderProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

const CustomSlider = ({ isOpen, children, className }: CustomSliderProps) => {
  return (
    <div className={cn("flex-1 overflow-hidden transition-all duration-300 ease-out", className)}>
      {isOpen ? (
        <ScrollArea className="h-full animate-fade-in">
          <div className="h-full">
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div className="h-full overflow-hidden animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default CustomSlider;
