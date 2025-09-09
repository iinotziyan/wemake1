import { useState, useEffect, useRef } from 'react';
import { ChatService } from '../../services/chatService';
import { TitleService } from '../../services/titleService';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  files?: File[];
  shouldAnimate?: boolean;
}

export interface MessageHandlingProps {
  chatId: string | undefined;
  getChatMessages: (chatId: string) => Message[];
  updateChatMessages: (chatId: string, messages: Message[]) => void;
  updateChatTitle?: (chatId: string, newTitle: string) => void;
}

export const useMessageHandling = ({
  chatId,
  getChatMessages,
  updateChatMessages,
  updateChatTitle,
}: MessageHandlingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const prevChatIdRef = useRef<string | undefined>();

  const recreateFileFromStorage = async (fileData: any): Promise<File | null> => {
    try {
      if (!fileData || !fileData.name || !fileData.type) {
        console.error('Invalid file data:', fileData);
        return null;
      }

      let blob: Blob;
      
      if (fileData.dataUrl) {
        const response = await fetch(fileData.dataUrl);
        blob = await response.blob();
      } else if (fileData.content) {
        blob = new Blob([fileData.content], { type: fileData.type });
      } else {
        console.error('No content found in file data:', fileData);
        return null;
      }

      return new File([blob], fileData.name, { 
        type: fileData.type,
        lastModified: fileData.lastModified || Date.now()
      });
    } catch (error) {
      console.error('Error recreating file:', error);
      return null;
    }
  };

  const processFilesForAI = async (files: File[]): Promise<any[]> => {
    const fileAttachments = [];
    
    for (const file of files) {
      try {
        if (file.type === 'text/plain') {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          
          fileAttachments.push({
            name: file.name,
            type: file.type,
            content: content
          });
        } else if (file.type.startsWith('image/')) {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          fileAttachments.push({
            name: file.name,
            type: file.type,
            content: content
          });
        } else {
          // For other file types, include basic info
          fileAttachments.push({
            name: file.name,
            type: file.type,
            content: `[File of type ${file.type}]`
          });
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    
    return fileAttachments;
  };

  useEffect(() => {
    if (chatId && !isInitialized) {
      const savedMessages = getChatMessages(chatId);
      
      if (savedMessages.length > 0) {
        // Load existing messages and ensure they NEVER animate
        const messagesWithoutAnimation = savedMessages.map(msg => ({
          ...msg,
          shouldAnimate: false // Critical: Never animate existing messages
        }));
        console.log('Loading existing messages for chat:', chatId, 'count:', messagesWithoutAnimation.length);
        setMessages(messagesWithoutAnimation);
        setIsInitialized(true);
      } else {
        // Handle initial prompt and files for new chats
        const initialPrompt = localStorage.getItem(`chat-${chatId}-initial`);
        const initialFilesData = localStorage.getItem(`chat-${chatId}-files`);
        
        if (initialPrompt) {
          const createInitialMessages = async () => {
            let recreatedFiles: File[] = [];
            
            if (initialFilesData) {
              try {
                const parsedFilesData = JSON.parse(initialFilesData);
                if (Array.isArray(parsedFilesData)) {
                  const filePromises = parsedFilesData.map(fileData => recreateFileFromStorage(fileData));
                  const results = await Promise.all(filePromises);
                  recreatedFiles = results.filter((file): file is File => file !== null);
                }
              } catch (error) {
                console.error('Error parsing initial files data:', error);
              }
            }

            const initialMessage: Message = {
              id: '1',
              content: initialPrompt,
              sender: 'user',
              timestamp: new Date(),
              files: recreatedFiles.length > 0 ? recreatedFiles : undefined,
              shouldAnimate: false // User messages never animate
            };
            
            // Show user message immediately and start AI response
            setMessages([initialMessage]);
            updateChatMessages(chatId, [initialMessage]);
            
            // Generate AI response using the chat service
            let aiResponse: Message;
            
            try {
              // Check if API keys are available
              if (!ChatService.hasApiKeys()) {
                aiResponse = {
                  id: '2',
                  content: 'Please add your API keys in Settings > Add API to enable chat functionality.',
                  sender: 'ai',
                  timestamp: new Date(),
                  shouldAnimate: true // Enable animation for new AI response
                };
              } else {
                // Process files for AI if they exist
                const fileAttachments = recreatedFiles.length > 0 
                  ? await processFilesForAI(recreatedFiles)
                  : [];

                // Call the AI service to get a dynamic response
                const chatMessages = [{
                  role: 'user' as const,
                  content: initialPrompt
                }];

                console.log('🚀 Calling AI service for initial response with prompt:', initialPrompt);
                console.log('📎 With files:', fileAttachments.length > 0 ? fileAttachments.map(f => f.name) : 'none');
                
                const aiResponseContent = await ChatService.sendMessage(chatMessages, fileAttachments);
                console.log('✅ AI service returned response:', aiResponseContent);
                
                aiResponse = {
                  id: '2',
                  content: aiResponseContent,
                  sender: 'ai',
                  timestamp: new Date(),
                  shouldAnimate: true // Enable animation for new AI response
                };
              }
            } catch (error) {
              console.error('❌ Error getting AI response:', error);
              aiResponse = {
                id: '2',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from AI service. Please check your API keys.'}`,
                sender: 'ai',
                timestamp: new Date(),
                shouldAnimate: true // Enable animation even for error messages
              };
            }
            
            const newMessages = [initialMessage, aiResponse];
            setMessages(newMessages);
            updateChatMessages(chatId, newMessages);
            
            // Generate AI-powered title after first response (only if API keys are available and response is not an error)
            if (ChatService.hasApiKeys() && !aiResponse.content.startsWith('Error:') && updateChatTitle) {
              try {
                console.log('🎯 Generating AI title for first message:', initialPrompt);
                const generatedTitle = await TitleService.generateTitle(initialPrompt);
                console.log('✅ Generated title:', generatedTitle);
                updateChatTitle(chatId, generatedTitle);
              } catch (error) {
                console.error('❌ Failed to generate title:', error);
                // Keep the original title if generation fails
              }
            }
            
            // Clean up the temporary storage
            localStorage.removeItem(`chat-${chatId}-initial`);
            localStorage.removeItem(`chat-${chatId}-files`);
            setIsInitialized(true);
          };

          createInitialMessages();
        } else {
          // No initial prompt, just mark as initialized with empty messages
          setMessages([]);
          setIsInitialized(true);
        }
      }
    }
  }, [chatId, getChatMessages, updateChatMessages, isInitialized]);

  // Reset only when chatId actually changes to a different chat
  useEffect(() => {
    if (chatId && prevChatIdRef.current && prevChatIdRef.current !== chatId) {
      // Only reset when switching to a different chat
      console.log('Switching from chat:', prevChatIdRef.current, 'to chat:', chatId);
      setIsInitialized(false);
      setMessages([]);
    }
    prevChatIdRef.current = chatId;
  }, [chatId]);

  const addMessage = (userMessage: Message, aiMessage: Message) => {
    // Ensure user message never animates
    const cleanUserMessage = {
      ...userMessage,
      shouldAnimate: false
    };
    
    // Ensure AI message animates only when it's a new response
    const animatedAiMessage = {
      ...aiMessage,
      shouldAnimate: true // Only new AI responses should animate
    };
    
    console.log('Adding new messages - user:', cleanUserMessage.id, 'ai:', animatedAiMessage.id, 'should animate:', animatedAiMessage.shouldAnimate);
    
    const newMessages = [...messages, cleanUserMessage, animatedAiMessage];
    setMessages(newMessages);
    
    // When saving to storage, disable animation for persistence
    const messagesForStorage = newMessages.map(msg => ({
      ...msg,
      shouldAnimate: false // Never save animation state
    }));
    
    if (chatId) {
      updateChatMessages(chatId, messagesForStorage);
    }
  };

  return {
    messages,
    addMessage,
  };
};

const recreateFileFromStorage = async (fileData: any): Promise<File | null> => {
  try {
    if (!fileData || !fileData.name || !fileData.type) {
      console.error('Invalid file data:', fileData);
      return null;
    }

    let blob: Blob;
    
    if (fileData.dataUrl) {
      const response = await fetch(fileData.dataUrl);
      blob = await response.blob();
    } else if (fileData.content) {
      blob = new Blob([fileData.content], { type: fileData.type });
    } else {
      console.error('No content found in file data:', fileData);
      return null;
    }

    return new File([blob], fileData.name, { 
      type: fileData.type,
      lastModified: fileData.lastModified || Date.now()
    });
  } catch (error) {
    console.error('Error recreating file:', error);
    return null;
  }
};

const processFilesForAI = async (files: File[]): Promise<any[]> => {
  const fileAttachments = [];
  
  for (const file of files) {
    try {
      if (file.type === 'text/plain') {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        
        fileAttachments.push({
          name: file.name,
          type: file.type,
          content: content
        });
      } else if (file.type.startsWith('image/')) {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        fileAttachments.push({
          name: file.name,
          type: file.type,
          content: content
        });
      } else {
        // For other file types, include basic info
        fileAttachments.push({
          name: file.name,
          type: file.type,
          content: `[File of type ${file.type}]`
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  
  return fileAttachments;
};
