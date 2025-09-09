
import React from 'react';
import { X } from 'lucide-react';

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradePopup = ({ isOpen, onClose }: UpgradePopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-6 max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-3">
            Upgrade Required
          </h3>
          <p className="text-gray-300 text-sm mb-6">
            You're on a Free Plan Human, upgrade to do multiple tasks at a time!!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
