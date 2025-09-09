import { Separator } from '../ui/separator';
interface SidebarLogoProps {
  isOpen: boolean;
}
const SidebarLogo = ({
  isOpen
}: SidebarLogoProps) => {
  return <>
      {/* Logo */}
      <div className="flex items-center p-4">
        <div className="text-white font-orbitron text-[2rem] font-bold">
          K
        </div>
      </div>

      {/* Separator below logo */}
      <div className="px-4">
        
      </div>
    </>;
};
export default SidebarLogo;