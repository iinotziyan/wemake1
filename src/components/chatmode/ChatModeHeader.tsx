
import React from 'react';

const ChatModeHeader = () => {
  return (
    <div className="text-left mb-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span 
          className="text-transparent bg-clip-text"
          style={{ 
            background: 'linear-gradient(15deg, rgb(255, 255, 255), rgb(192, 192, 192), rgb(0, 0, 0))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Hii, Human
          <br />
          What would you like to Do today?
        </span>
      </h1>
      <p className="text-gray-400 text-lg">
        Use one of the most common prompts<br />
        below or use your own to begin
      </p>
    </div>
  );
};

export default ChatModeHeader;
