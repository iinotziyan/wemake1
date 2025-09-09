
import React from 'react';

const LoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-[#1a1a1a] text-white rounded-[20px] p-4 max-w-[70%]">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export default LoadingIndicator;
