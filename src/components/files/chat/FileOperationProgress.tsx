
import React from 'react';
import { X } from 'lucide-react';

interface FileOperationProgressProps {
  operation: string;
  isVisible: boolean;
  isPersistent?: boolean;
  isCompleted?: boolean;
  isCancelled?: boolean;
  cancellationReason?: string;
}

export const FileOperationProgress = ({ 
  operation, 
  isVisible, 
  isPersistent = false, 
  isCompleted = false,
  isCancelled = false,
  cancellationReason
}: FileOperationProgressProps) => {
  if (!isVisible) return null;

  const getBackgroundColor = () => {
    if (isCancelled) return 'bg-red-900/20 border-red-500/30';
    if (isPersistent) return 'bg-blue-900/20 border-blue-500/30';
    return 'bg-[#1a1a1a]';
  };

  const getTextColor = () => {
    if (isCancelled) return 'text-red-200';
    if (isPersistent) return 'text-blue-200';
    return 'text-white';
  };

  const getDisplayText = () => {
    if (isCancelled) return 'CANCELLED';
    if (isCompleted) return 'DONE';
    return `${operation}...`;
  };

  return (
    <div className="flex justify-start my-6">
      <div className={`border border-gray-600 rounded-lg p-3 w-full max-w-xs sm:max-w-sm md:max-w-md transition-all duration-300 ${getBackgroundColor()}`}>
        <div className="flex items-center justify-between w-full">
          <span className={`text-sm font-medium flex-1 ${getTextColor()}`}>
            {getDisplayText()}
          </span>
          {!isCompleted && !isCancelled && (
            <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 rounded-full animate-spin ml-3 flex-shrink-0 ${
              isPersistent 
                ? 'border-blue-400 border-t-blue-200' 
                : 'border-gray-400 border-t-white'
            }`}></div>
          )}
          {isCompleted && (
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full ml-3 flex-shrink-0 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {isCancelled && (
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full ml-3 flex-shrink-0 flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        {isCancelled && cancellationReason && (
          <div className="mt-2 pt-2 border-t border-red-500/20">
            <p className="text-xs text-red-300/80 leading-relaxed">
              {cancellationReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
