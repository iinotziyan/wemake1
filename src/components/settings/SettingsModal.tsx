
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { X, User, Palette, MousePointer, Wrench, Database, Grid3X3, Languages, Key } from 'lucide-react';
import { Button } from '../ui/button';
import ApiKeyDialog from './ApiKeyDialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({
  isOpen,
  onClose
}: SettingsModalProps) => {
  const [activeSection, setActiveSection] = useState('Account');
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  const sidebarItems = [{
    icon: User,
    label: 'Account',
    id: 'Account'
  }, {
    icon: Palette,
    label: 'Appearance',
    id: 'Appearance'
  }, {
    icon: MousePointer,
    label: 'Behavior',
    id: 'Behavior'
  }, {
    icon: Wrench,
    label: 'Customize',
    id: 'Customize'
  }, {
    icon: Database,
    label: 'Data Controls',
    id: 'Data Controls'
  }, {
    icon: Grid3X3,
    label: 'Connected Apps',
    id: 'Connected Apps'
  }];

  const renderContent = () => {
    switch (activeSection) {
      case 'Account':
        return <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  ZW
                </div>
                <div>
                  <div className="text-white font-medium">Zerox Wayne</div>
                  <div className="text-gray-400 text-sm">zeroxwayne@gmail.com</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]" style={{
              borderRadius: '50px'
            }}>
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl">
              <div>
                <div className="text-white font-medium">Connect your zw Account</div>
              </div>
              <Button variant="outline" size="sm" className="bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]" style={{
              borderRadius: '50px'
            }}>
                Connect
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Language</span>
                <Languages className="w-4 h-4 text-gray-400" />
              </div>
              <Button variant="outline" size="sm" className="bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]" style={{
              borderRadius: '50px'
            }}>
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Add API</span>
                <Key className="w-4 h-4 text-gray-400" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#2a2a2a] border-gray-600 text-white hover:bg-[#3a3a3a]" 
                style={{
                  borderRadius: '50px'
                }}
                onClick={() => setApiKeyDialogOpen(true)}
              >
                API
              </Button>
            </div>

            <div className="p-4 bg-[#1a1a1a] rounded-xl">
              <div className="text-gray-500 text-sm mb-4">1197f9ab-1036-4eba-8c0e-eace04802e88</div>
              
              <div className="bg-black rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">⚡</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Kairo Pro</div>
                      <div className="text-gray-400 text-sm">Fewer rate limits, more capabilities</div>
                    </div>
                  </div>
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6">
                    Go Super
                  </Button>
                </div>
              </div>
            </div>
          </div>;
      default:
        return <div className="text-gray-400 text-center py-12">
            <div className="text-lg">{activeSection} settings</div>
            <div className="text-sm mt-2">Settings for {activeSection.toLowerCase()} will be available here.</div>
          </div>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#0b0b0b] border-gray-800 p-0 overflow-hidden" style={{
        width: '800px',
        height: '450px',
        borderRadius: '30px',
        maxWidth: '800px'
      }}>
          <style>{`
            .settings-content-scroll {
              scrollbar-width: thin;
              scrollbar-color: rgb(15 15 15) transparent;
            }
            
            .settings-content-scroll::-webkit-scrollbar {
              width: 6px;
            }
            
            .settings-content-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .settings-content-scroll::-webkit-scrollbar-thumb {
              background-color: rgb(15 15 15);
              border-radius: 3px;
              border: none;
              transition: background-color 0.15s ease-in-out;
            }
            
            .settings-content-scroll::-webkit-scrollbar-thumb:hover {
              background-color: rgb(38 38 38);
            }
          `}</style>
          <div className="flex h-full">
            {/* Left Sidebar */}
            <div className="w-64 bg-transparent p-4 flex-shrink-0">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-white text-xl">Settings</DialogTitle>
              </DialogHeader>

              <nav className="space-y-1">
                {sidebarItems.map(item => <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors group ${activeSection === item.id ? 'bg-[#1a1a1a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#161616]'}`}>
                    <item.icon className={`w-5 h-5 stroke-[1.5] transition-all duration-200 ${activeSection === item.id ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]' : ''}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>)}
              </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 bg-transparent flex flex-col overflow-hidden">
              <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0">
                <h2 className="text-white text-xl font-semibold">{activeSection}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-6 settings-content-scroll" style={{
              maxHeight: 'calc(450px - 120px)'
            }}>
                {renderContent()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ApiKeyDialog 
        isOpen={apiKeyDialogOpen}
        onClose={() => setApiKeyDialogOpen(false)}
      />
    </>
  );
};

export default SettingsModal;
