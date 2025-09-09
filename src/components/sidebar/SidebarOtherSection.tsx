import { FileText, ListTodo, AtSign, Calendar, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';

interface SidebarOtherSectionProps {
  isOpen: boolean;
}

const SidebarOtherSection = ({ isOpen }: SidebarOtherSectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't render the other section when sidebar is closed
  if (!isOpen) {
    return null;
  }


  const otherLinks = [{
    name: 'Emails',
    icon: AtSign,
    href: '#'
  }, {
    name: 'Summaries',
    icon: FileText,
    href: '#'
  }, {
    name: 'Calendar',
    icon: Calendar,
    href: '#',
    comingSoon: true
  }];


  const getLinkHoverClass = () => {
    return isOpen 
      ? 'hover:bg-white/10' 
      : 'hover:bg-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.8)]';
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <TooltipProvider>
      {/* Other Section */}
      {isOpen && (
        <div className="px-4 mb-3">
          <h3 className="text-gray-400 font-nunito text-xs font-semibold uppercase tracking-wider">
            OTHER
          </h3>
        </div>
      )}

      {/* Other Navigation Links */}
      <nav className="px-3 space-y-2">
        {otherLinks.map((link, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link
                to={link.comingSoon ? '#' : link.href}
                className={`
                  flex items-center gap-3 text-white font-nunito
                  ${getLinkHoverClass()} rounded-lg transition-all duration-200
                  relative border border-transparent
                  ${isOpen ? 'text-sm px-3 py-[10px] h-[38px] w-[229px]' : 'justify-center px-3 py-3'}
                  ${link.comingSoon ? 'cursor-default opacity-70' : 'cursor-pointer'}
                  ${isActive(link.href) ? 'bg-white/10 border-[#4b4b4b]' : ''}
                `}>
                <link.icon className={`
                    text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)]
                    hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)]
                    hover:filter hover:brightness-150
                    transition-all duration-200
                    ${isOpen ? 'w-5 h-5' : 'w-4 h-4 hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]'}
                    ${isActive(link.href) ? 'brightness-150' : ''}
                  `} />
                {isOpen && (
                  <span className="font-nunito text-sm font-medium flex items-center gap-2">
                    {link.name}
                    {link.comingSoon && (
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent 
                side="right" 
                className="bg-[#1a1a1a] border border-gray-700 text-white shadow-lg"
              >
                {link.name}
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
};

export default SidebarOtherSection;
