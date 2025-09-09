
import React from 'react';
import { User, Mail, FileText, Settings } from 'lucide-react';

interface PromptIdeasGridProps {
  onPromptClick: (promptText: string) => void;
}

const PromptIdeasGrid = ({ onPromptClick }: PromptIdeasGridProps) => {
  const promptIdeas = [
    {
      title: "Write a to-do list for a personal project or task",
      icon: User
    },
    {
      title: "Generate an email to reply to a job offer",
      icon: Mail
    },
    {
      title: "Summarise this article or text for me in one paragraph",
      icon: FileText
    },
    {
      title: "How does AI work in a technical capacity",
      icon: Settings
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {promptIdeas.map((idea, index) => (
        <div
          key={index}
          onClick={() => onPromptClick(idea.title)}
          className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-600 transition-colors group"
        >
          <p className="text-sm text-gray-300 mb-4 group-hover:text-white transition-colors">
            {idea.title}
          </p>
          <div className="flex justify-start">
            <idea.icon className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromptIdeasGrid;
