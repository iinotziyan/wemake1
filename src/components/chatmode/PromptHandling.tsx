
import { useState } from 'react';

export const usePromptHandling = () => {
  const [prompt, setPrompt] = useState('');

  const handlePromptClick = (promptText: string) => {
    setPrompt(promptText);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 5000) {
      setPrompt(value);
      
      e.target.style.height = 'auto';
      const newHeight = Math.min(Math.max(e.target.scrollHeight, 130), 250);
      e.target.style.height = `${newHeight}px`;
    }
  };

  return {
    prompt,
    setPrompt,
    handlePromptClick,
    handleTextareaChange,
  };
};
