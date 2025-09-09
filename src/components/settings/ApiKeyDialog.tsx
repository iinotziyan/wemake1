
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Key, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKeys {
  openai: string[];
  gemini: string[];
  groq: string[];
  openrouter: string[];
}

const ApiKeyDialog = ({ isOpen, onClose }: ApiKeyDialogProps) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: [''],
    gemini: [''],
    groq: [''],
    openrouter: ['']
  });
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'groq' | 'openrouter'>('openrouter');
  const { toast } = useToast();

  // Load existing keys when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadedKeys: ApiKeys = {
        openai: JSON.parse(localStorage.getItem('openai_api_keys') || '[""]'),
        gemini: JSON.parse(localStorage.getItem('gemini_api_keys') || '[""]'),
        groq: JSON.parse(localStorage.getItem('groq_api_keys') || '[""]'),
        openrouter: JSON.parse(localStorage.getItem('openrouter_api_keys') || '[""]')
      };
      
      setApiKeys(loadedKeys);

      // Determine which provider is currently active (prioritize OpenRouter)
      if (loadedKeys.openrouter.some(key => key.trim())) {
        setSelectedProvider('openrouter');
      } else if (loadedKeys.groq.some(key => key.trim())) {
        setSelectedProvider('groq');
      } else if (loadedKeys.gemini.some(key => key.trim())) {
        setSelectedProvider('gemini');
      } else if (loadedKeys.openai.some(key => key.trim())) {
        setSelectedProvider('openai');
      } else {
        setSelectedProvider('openrouter');
      }
    }
  }, [isOpen]);

  const handleProviderChange = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter') => {
    setSelectedProvider(provider);
  };

  const addKeyField = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter') => {
    if (apiKeys[provider].length < 5) {
      setApiKeys(prev => ({
        ...prev,
        [provider]: [...prev[provider], '']
      }));
    }
  };

  const removeKeyField = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter', index: number) => {
    if (apiKeys[provider].length > 1) {
      setApiKeys(prev => ({
        ...prev,
        [provider]: prev[provider].filter((_, i) => i !== index)
      }));
    }
  };

  const updateKey = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter', index: number, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: prev[provider].map((key, i) => i === index ? value : key)
    }));
  };

  const toggleShowKey = (provider: string, index: number) => {
    const keyId = `${provider}-${index}`;
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleSave = () => {
    // Clear all API keys first
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('groq_api_key');
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('nvidia_api_key');
    localStorage.removeItem('openai_api_keys');
    localStorage.removeItem('gemini_api_keys');
    localStorage.removeItem('groq_api_keys');
    localStorage.removeItem('openrouter_api_keys');

    // Save only the selected provider's keys
    const validKeys = apiKeys[selectedProvider].filter(key => key.trim());
    if (validKeys.length > 0) {
      localStorage.setItem(`${selectedProvider}_api_keys`, JSON.stringify(validKeys));
      // Also save the first key in the old format for backward compatibility
      localStorage.setItem(`${selectedProvider}_api_key`, validKeys[0]);
    }

    toast({
      title: "API Keys Saved",
      description: `Your ${selectedProvider.toUpperCase()} API keys (${validKeys.length}) have been saved successfully. You can now use the chat functionality with failover support.`,
    });

    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('groq_api_key');
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('nvidia_api_key');
    localStorage.removeItem('openai_api_keys');
    localStorage.removeItem('gemini_api_keys');
    localStorage.removeItem('groq_api_keys');
    localStorage.removeItem('openrouter_api_keys');
    setApiKeys({
      openai: [''],
      gemini: [''],
      groq: [''],
      openrouter: ['']
    });
    setSelectedProvider('openrouter');
    
    toast({
      title: "API Keys Cleared",
      description: "All API keys have been removed.",
    });
  };

  const getActiveKeys = () => {
    return apiKeys[selectedProvider].filter(key => key.trim());
  };

  const renderKeyInputs = (provider: 'openai' | 'gemini' | 'groq' | 'openrouter', placeholder: string, color: string) => {
    return (
      <div className="space-y-3">
        {apiKeys[provider].map((key, index) => (
          <div key={index} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKeys[`${provider}-${index}`] ? "text" : "password"}
                placeholder={`${placeholder} ${index + 1}`}
                value={key}
                onChange={(e) => updateKey(provider, index, e.target.value)}
                className="bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-500 focus:border-white pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShowKey(provider, index)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKeys[`${provider}-${index}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {apiKeys[provider].length > 1 && (
              <Button
                type="button"
                onClick={() => removeKeyField(provider, index)}
                variant="outline"
                size="sm"
                className="bg-[#1a1a1a] border-gray-600 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {apiKeys[provider].length < 5 && (
          <Button
            type="button"
            onClick={() => addKeyField(provider)}
            variant="outline"
            size="sm"
            className={`bg-[#1a1a1a] border-gray-600 text-${color}-400 hover:bg-${color}-500/10 hover:text-${color}-300`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Key ({apiKeys[provider].length}/5)
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0b] border-gray-800 p-0 overflow-hidden max-w-2xl" style={{
        borderRadius: '20px',
        maxHeight: '80vh'
      }}>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-white" />
                <DialogTitle className="text-white text-xl">API Keys Management</DialogTitle>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">Choose your AI provider and add up to 5 API keys for automatic failover:</p>
              
              <div className="space-y-4">
                {/* OpenRouter Option - Listed First */}
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProvider === 'openrouter' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`} onClick={() => handleProviderChange('openrouter')}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      checked={selectedProvider === 'openrouter'}
                      onChange={() => handleProviderChange('openrouter')}
                      className="text-orange-500"
                    />
                    <label className="text-white font-medium">OpenRouter API Keys</label>
                    {selectedProvider === 'openrouter' && <span className="text-orange-400 text-xs">ACTIVE</span>}
                  </div>
                  {selectedProvider === 'openrouter' && (
                    <div className="space-y-3">
                      {renderKeyInputs('openrouter', 'sk-or-v1-...', 'orange')}
                      <p className="text-gray-400 text-sm">Access Claude, GPT, Llama, and 200+ models with lower costs. Get your API keys from OpenRouter.ai</p>
                    </div>
                  )}
                </div>

                {/* OpenAI Option */}
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProvider === 'openai' 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`} onClick={() => handleProviderChange('openai')}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      checked={selectedProvider === 'openai'}
                      onChange={() => handleProviderChange('openai')}
                      className="text-blue-500"
                    />
                    <label className="text-white font-medium">OpenAI API Keys</label>
                    {selectedProvider === 'openai' && <span className="text-blue-400 text-xs">ACTIVE</span>}
                  </div>
                  {selectedProvider === 'openai' && (
                    <div className="space-y-3">
                      {renderKeyInputs('openai', 'sk-...', 'blue')}
                      <p className="text-gray-400 text-sm">Get your API keys from OpenAI dashboard</p>
                    </div>
                  )}
                </div>

                {/* Gemini Option */}
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProvider === 'gemini' 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`} onClick={() => handleProviderChange('gemini')}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      checked={selectedProvider === 'gemini'}
                      onChange={() => handleProviderChange('gemini')}
                      className="text-purple-500"
                    />
                    <label className="text-white font-medium">Google Gemini API Keys</label>
                    {selectedProvider === 'gemini' && <span className="text-purple-400 text-xs">ACTIVE</span>}
                  </div>
                  {selectedProvider === 'gemini' && (
                    <div className="space-y-3">
                      {renderKeyInputs('gemini', 'AIza...', 'purple')}
                      <p className="text-gray-400 text-sm">Get your API keys from Google AI Studio</p>
                    </div>
                  )}
                </div>

                {/* Groq Option */}
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProvider === 'groq' 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`} onClick={() => handleProviderChange('groq')}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      checked={selectedProvider === 'groq'}
                      onChange={() => handleProviderChange('groq')}
                      className="text-green-500"
                    />
                    <label className="text-white font-medium">Groq API Keys</label>
                    {selectedProvider === 'groq' && <span className="text-green-400 text-xs">ACTIVE</span>}
                  </div>
                  {selectedProvider === 'groq' && (
                    <div className="space-y-3">
                      {renderKeyInputs('groq', 'gsk_...', 'green')}
                      <p className="text-gray-400 text-sm">Get your API keys from Groq Console</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-white text-black hover:bg-gray-200"
                disabled={getActiveKeys().length === 0}
              >
                Save API Keys ({getActiveKeys().length})
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-[#1a1a1a] border-gray-600 text-white hover:bg-[#2a2a2a]"
              >
                Clear All
              </Button>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
              <p className="text-gray-300 text-sm">
                <strong>Failover System:</strong> If your primary API key hits its limit or fails, the system will automatically try the next available key. 
                Your keys are stored locally and only used for direct API calls.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
