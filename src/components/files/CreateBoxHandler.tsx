
import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Globe, Code, Gamepad2, Image, Upload } from 'lucide-react';
import { saveRecentFile } from '../../services/fileService';

interface CreateBoxHandlerProps {
  onFileCreated: (fileId: string) => void;
}

const CreateBoxHandler = ({ onFileCreated }: CreateBoxHandlerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateDocument = async () => {
    const newFile = new File([''], 'untitled.md', { type: 'text/markdown' });
    const fileId = await saveRecentFile(newFile);
    if (fileId) {
      onFileCreated(fileId);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Process the first file to show immediately
      const firstFile = files[0];
      const firstFileId = await saveRecentFile(firstFile);
      if (firstFileId) {
        onFileCreated(firstFileId);
      }
      
      // Process remaining files in the background
      for (let i = 1; i < files.length; i++) {
        await saveRecentFile(files[i]);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createOptions = [
    {
      icon: FileText,
      title: 'Document',
      description: 'Create a new document',
      onClick: handleCreateDocument,
      available: true
    },
    {
      icon: Globe,
      title: 'Webpage',
      description: 'Coming Soon',
      onClick: () => {},
      available: false
    },
    {
      icon: Code,
      title: 'Code',
      description: 'Coming Soon',
      onClick: () => {},
      available: false
    },
    {
      icon: Gamepad2,
      title: 'Game',
      description: 'Coming Soon',
      onClick: () => {},
      available: false
    },
    {
      icon: Image,
      title: 'Image',
      description: 'Coming Soon',
      onClick: () => {},
      available: false
    },
    {
      icon: Upload,
      title: 'Upload Files',
      description: 'Upload up to 30+ files',
      onClick: () => fileInputRef.current?.click(),
      available: true
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-6">
      <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Create something new</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {createOptions.map((option, index) => (
            <div
              key={option.title}
              className={`group relative bg-[#1a1a1a] rounded-[40px] p-6 transition-all duration-300 ${
                option.available 
                  ? 'hover:bg-[#2a2a2a] cursor-pointer hover:scale-105' 
                  : 'cursor-not-allowed opacity-75'
              }`}
              onClick={option.available ? option.onClick : undefined}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#3a3a3a] transition-colors">
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1">{option.title}</h3>
                {!option.available && (
                  <span className="text-xs text-white bg-transparent border border-white px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept="*/*"
      />
    </div>
  );
};

export default CreateBoxHandler;
