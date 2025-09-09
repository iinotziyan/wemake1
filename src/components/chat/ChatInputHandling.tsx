
import { useState, useRef } from 'react';
import { Message } from './MessageHandling';
import { ChatService } from '../../services/chatService';
import { TitleService } from '../../services/titleService';

export interface ChatInputHandlingProps {
  messages: Message[];
  addMessage: (userMessage: Message, aiMessage: Message) => void;
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  chatId?: string;
  updateChatTitle?: (chatId: string, newTitle: string) => void;
}

interface FileAttachment {
  name: string;
  type: string;
  content: string;
}

export const useChatInputHandling = ({
  messages,
  addMessage,
  uploadedFiles,
  setUploadedFiles,
  chatId,
  updateChatTitle,
}: ChatInputHandlingProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processFiles = async (files: File[]): Promise<FileAttachment[]> => {
    console.log('Processing files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    const fileAttachments: FileAttachment[] = [];
    
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
        
        if (file.type === 'text/plain') {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              console.log(`Text file content length: ${result.length}`);
              resolve(result);
            };
            reader.onerror = (error) => {
              console.error('FileReader error for text file:', error);
              reject(error);
            };
            reader.readAsText(file);
          });
          
          fileAttachments.push({
            name: file.name,
            type: file.type,
            content: content
          });
          console.log(`✅ Added text file: ${file.name} with ${content.length} characters`);
        } else if (file.type.startsWith('image/')) {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              console.log(`Image file processed: ${file.name}, data URL length: ${result.length}`);
              resolve(result);
            };
            reader.onerror = (error) => {
              console.error('FileReader error for image file:', error);
              reject(error);
            };
            reader.readAsDataURL(file);
          });
          
          fileAttachments.push({
            name: file.name,
            type: file.type,
            content: content // This will be a data URL like "data:image/jpeg;base64,..."
          });
          console.log(`✅ Added image file: ${file.name}`);
        } else {
          console.log(`⚠️ Unsupported file type: ${file.type} for file: ${file.name}`);
          // For other file types, just include the name and type
          fileAttachments.push({
            name: file.name,
            type: file.type,
            content: `[File of type ${file.type} - not supported for analysis]`
          });
        }
      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
      }
    }
    
    console.log('✅ Final file attachments:', fileAttachments.map(f => ({ name: f.name, type: f.type, contentLength: f.content.length })));
    return fileAttachments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀🚀🚀 ENTRY POINT - handleSubmit called!');
    console.log('🚀 ChatInputHandling handleSubmit called with prompt:', prompt);
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    // Check if this is a chat title rename command
    console.log('🔍 Checking for rename command:', prompt);
    console.log('🔍 ChatId:', chatId);
    console.log('🔍 UpdateChatTitle function available:', !!updateChatTitle);
    
    const renameResult = TitleService.parseRenameCommand(prompt);
    console.log('🔍 Rename result:', renameResult);
    
    if (renameResult.isRenameCommand && renameResult.newTitle && chatId && updateChatTitle) {
      // Handle title rename command
      const userMessage: Message = {
        id: Date.now().toString(),
        content: prompt,
        sender: 'user',
        timestamp: new Date(),
        files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `✅ Chat title updated successfully!\n\n**New title:** ${renameResult.newTitle}\n\nThe chat title has been changed in the sidebar.`,
        sender: 'ai',
        timestamp: new Date(),
        shouldAnimate: true
      };

      // Update the title first
      updateChatTitle(chatId, renameResult.newTitle);
      
      // Add messages to show the action was completed
      addMessage(userMessage, aiMessage);
      setPrompt('');
      setUploadedFiles([]);
      return;
    }

    // Check if API keys are available
    if (!ChatService.hasApiKeys()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: prompt,
        sender: 'user',
        timestamp: new Date(),
        files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Please add your API keys in Settings > Add API to enable chat functionality.',
        sender: 'ai',
        timestamp: new Date(),
        shouldAnimate: true
      };

      addMessage(userMessage, aiMessage);
      setPrompt('');
      setUploadedFiles([]);
      return;
    }

    // Create user message first
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      sender: 'user',
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    // Create empty AI message placeholder that will show loading indicator
    const aiPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      shouldAnimate: false
    };

    // Add both messages immediately so user message appears right away
    addMessage(userMessage, aiPlaceholder);

    // Clear input immediately
    setPrompt('');
    setUploadedFiles([]);

    // For first message (no existing messages), show loading immediately
    // For subsequent messages, show loading after 1 second delay
    if (messages.length === 0) {
      setIsLoading(true);
      console.log('🚀 First message - showing loading indicator immediately');
    } else {
      // Set up delayed loading indicator for subsequent messages
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(true);
        console.log('⏰ AI is taking longer than expected, showing loading indicator');
      }, 1000);
    }

    try {
      // Process uploaded files
      const fileAttachments = await processFiles(uploadedFiles);
      console.log(`📎 Processed ${fileAttachments.length} file attachments`);

      // Convert messages to the format expected by ChatService
      const chatMessages = [
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: userMessage.content
        }
      ];

      console.log('🚀 Sending to ChatService with files:', fileAttachments.length > 0);

      // Call the API with files
      const response = await ChatService.sendMessage(chatMessages, fileAttachments);

      // Clear the loading timeout since we got a response
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoading(false);

      // Update the AI placeholder message with the actual response
      const updatedAiMessage: Message = {
        ...aiPlaceholder,
        content: response,
        shouldAnimate: true
      };

      // Replace the placeholder with the actual response
      addMessage(userMessage, updatedAiMessage);
    } catch (error) {
      console.error('❌ Chat API error:', error);
      
      // Clear the loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoading(false);
      
      // Update the AI placeholder message with error
      const errorAiMessage: Message = {
        ...aiPlaceholder,
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from AI service. Please check your API keys.'}`,
        shouldAnimate: true
      };

      // Replace the placeholder with the error message
      addMessage(userMessage, errorAiMessage);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 5000) {
      setPrompt(value);
      e.target.style.height = 'auto';
      const newHeight = Math.min(Math.max(e.target.scrollHeight, 50), 150);
      e.target.style.height = `${newHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        handleSubmit(e as any);
      }
    }
  };

  return {
    prompt,
    handleSubmit,
    handleTextareaChange,
    handleKeyDown,
    isLoading,
  };
};
