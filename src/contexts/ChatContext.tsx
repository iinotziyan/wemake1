
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  shouldAnimate?: boolean;
}

interface ChatItem {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
  isPinned?: boolean;
}

interface ChatContextType {
  chats: ChatItem[];
  addChat: (title: string) => string;
  getChatMessages: (chatId: string) => Message[];
  addMessageToChat: (chatId: string, message: Message) => void;
  updateChatMessages: (chatId: string, messages: Message[]) => void;
  updateChatTitle: (chatId: string, newTitle: string) => void;
  deleteChat: (chatId: string) => void;
  togglePinChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    const savedChats = localStorage.getItem('chat-history');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: chat.messages?.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          shouldAnimate: false // Critical: Ensure saved messages never animate on load
        })) || [],
        isPinned: chat.isPinned || false
      }));
      setChats(parsedChats);
    }
  }, []);

  const saveChatsToStorage = (updatedChats: ChatItem[]) => {
    // When saving to storage, ensure no messages have shouldAnimate: true
    const chatsForStorage = updatedChats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg => ({
        ...msg,
        shouldAnimate: false
      }))
    }));
    localStorage.setItem('chat-history', JSON.stringify(chatsForStorage));
  };

  const addChat = (title: string): string => {
    const chatId = Math.floor(Math.random() * 100000).toString();
    const newChat: ChatItem = {
      id: chatId,
      title: title.slice(0, 50) + (title.length > 50 ? '...' : ''),
      createdAt: new Date(),
      messages: [], // Always start with empty messages for proper isolation
      isPinned: false
    };
    
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
    
    return chatId;
  };

  const getChatMessages = (chatId: string): Message[] => {
    const chat = chats.find(c => c.id === chatId);
    return chat?.messages || [];
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, message] }
        : chat
    );
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
  };

  const updateChatMessages = (chatId: string, messages: Message[]) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages }
        : chat
    );
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
  };

  const updateChatTitle = (chatId: string, newTitle: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle }
        : chat
    );
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
  };

  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
  };

  const togglePinChat = (chatId: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, isPinned: !chat.isPinned }
        : chat
    );
    setChats(updatedChats);
    saveChatsToStorage(updatedChats);
  };

  return (
    <ChatContext.Provider value={{ 
      chats, 
      addChat, 
      getChatMessages, 
      addMessageToChat, 
      updateChatMessages,
      updateChatTitle,
      deleteChat,
      togglePinChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
