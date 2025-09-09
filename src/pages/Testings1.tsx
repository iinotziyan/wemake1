
import { useSidebarContext } from "../contexts/SidebarContext";
import DarkSidebar from "../components/DarkSidebar";
import GlassIcons from "../components/ui/GlassIcons";
import { FileText, Book, Heart, Cloud, Edit, BarChart2 } from "lucide-react";

const items = [
  { icon: <FileText />, color: 'blue', label: 'Files' },
  { icon: <Book />, color: 'purple', label: 'Books' },
  { icon: <Heart />, color: 'red', label: 'Health' },
  { icon: <Cloud />, color: 'indigo', label: 'Weather' },
  { icon: <Edit />, color: 'orange', label: 'Notes' },
  { icon: <BarChart2 />, color: 'green', label: 'Stats' },
];

const Testings1 = () => {
  const { isOpen } = useSidebarContext();

  return (
    <div className="flex min-h-screen w-full bg-[#0b0b0b]">
      <DarkSidebar />
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-[300px]' : 'ml-[70px]'}`}>
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl font-bold text-white text-center mb-8">
              Testings1 Page
            </h1>
            <div style={{ height: '600px', position: 'relative' }}>
              <GlassIcons items={items} className="custom-class"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testings1;
