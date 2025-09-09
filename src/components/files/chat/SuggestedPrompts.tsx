
import React from 'react';

interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  isVisible: boolean;
  variant?: 'input' | 'center';
}

export const SuggestedPrompts = ({ prompts, onPromptClick, isVisible, variant = 'input' }: SuggestedPromptsProps) => {
  if (!isVisible || prompts.length === 0) return null;

  if (variant === 'center') {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h3 className="text-gray-400 text-sm mb-4 font-medium">Get started with these suggestions:</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptClick(prompt)}
                className="bg-transparent hover:bg-white/10 text-white text-sm px-4 py-2 rounded-full border border-gray-600 transition-all duration-200 hover:border-gray-400"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-2">
      <div className="flex flex-wrap gap-2 justify-center">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="bg-transparent hover:bg-white/10 text-white text-sm px-4 py-2 rounded-full border border-gray-600 transition-all duration-200 hover:border-gray-400"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
