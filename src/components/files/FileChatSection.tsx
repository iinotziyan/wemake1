import { useState, useEffect } from 'react';
import { getRecentFiles } from '../../services/fileService';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { useFileHandling } from '../chatmode/FileHandling';
import FilePreviewModal from '../chatmode/FilePreviewModal';
import TxtPreviewModal from '../chatmode/TxtPreviewModal';
import TextContentDialog from '../chatmode/TextContentDialog';
import { ChatService } from '../../services/chatService';
import { UpgradePopup } from './UpgradePopup';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  files?: File[];
  showProgress?: boolean;
  progressOperation?: string;
  isPersistentProgress?: boolean;
  isProgressCompleted?: boolean;
  isProgressCancelled?: boolean;
  cancellationReason?: string;
}

interface FileChatSectionProps {
  selectedFile: string | null;
  onClose: () => void;
}

const FileChatSection = ({ selectedFile, onClose }: FileChatSectionProps) => {
  const [chatHistories, setChatHistories] = useState<{[fileId: string]: Message[]}>({});
  const [promptStates, setPromptStates] = useState<{[fileId: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachPopoverOpen, setAttachPopoverOpen] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [txtPreviewFile, setTxtPreviewFile] = useState<File | null>(null);
  const [textContentDialogOpen, setTextContentDialogOpen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressOperation, setProgressOperation] = useState('');
  const [currentProgressMessageId, setCurrentProgressMessageId] = useState<string | null>(null);
  const [isEditingDisabled, setIsEditingDisabled] = useState(false);
  const [isTaskInProgress, setIsTaskInProgress] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [canCancelTask, setCanCancelTask] = useState(false);
  const [fileSuggestedPrompts, setFileSuggestedPrompts] = useState<{[fileId: string]: { show: boolean; prompts: string[] }}>({});
  const [blockedFileChats, setBlockedFileChats] = useState<Set<string>>(() => {
    // Initialize blocked chats from localStorage to persist across page visits
    const saved = localStorage.getItem('blockedFileChats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return new Set(parsed);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const files = getRecentFiles();
  const file = selectedFile ? files.find(f => f.id === selectedFile) : null;
  const messages = selectedFile ? (chatHistories[selectedFile] || []) : [];
  const prompt = selectedFile ? (promptStates[selectedFile] || '') : '';

  const currentFileSuggestedPrompts = selectedFile ? (fileSuggestedPrompts[selectedFile] || { show: false, prompts: [] }) : { show: false, prompts: [] };

  const {
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
    handleFilePreview,
    handleAttachMenuClick,
    handleTextContentSave,
  } = useFileHandling({
    uploadedFiles,
    setUploadedFiles,
    setPreviewFile,
    setTxtPreviewFile,
    setAttachPopoverOpen,
    setTextContentDialogOpen,
  });

  // Generate random suggested prompts
  const generateSuggestedPrompts = () => {
    const allPrompts = [
      "Rewrite It Again",
      "Continue With Something New", 
      "Summarize",
      "Make It Better",
      "Fix Any Issues",
      "Simplify This",
      "Add More Details",
      "Change The Style",
      "Optimize It",
      "Make It Shorter",
      "Expand This",
      "Improve Readability"
    ];
    
    // Shuffle and pick 3 random prompts
    const shuffled = allPrompts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const [centerPrompts, setCenterPrompts] = useState<string[]>(() => generateSuggestedPrompts());

  useEffect(() => {
    localStorage.setItem('blockedFileChats', JSON.stringify(Array.from(blockedFileChats)));
  }, [blockedFileChats]);

  useEffect(() => {
    if (selectedFile) {
      setIsInitialLoad(true);
      const savedMessages = localStorage.getItem(`fileChat-${selectedFile}`);
      const savedPrompt = localStorage.getItem(`fileChatPrompt-${selectedFile}`);
      
      // Check for incomplete tasks that need to be marked as cancelled
      const savedTaskState = localStorage.getItem(`fileTaskState-${selectedFile}`);
      let shouldMarkAsCancelled = false;
      let savedProgressMessageId = null;
      let savedProgressOperation = '';
      
      if (savedTaskState) {
        try {
          const taskState = JSON.parse(savedTaskState);
          if (taskState.isTaskInProgress && taskState.currentProgressMessageId) {
            shouldMarkAsCancelled = true;
            savedProgressMessageId = taskState.currentProgressMessageId;
            savedProgressOperation = taskState.progressOperation || '';
          }
        } catch (error) {
          console.error('Error parsing saved task state:', error);
        }
      }
      
      if (savedMessages) {
        try {
          let parsedMessages = JSON.parse(savedMessages);
          
          // If there was an incomplete task, mark the progress message as cancelled
          if (shouldMarkAsCancelled && savedProgressMessageId) {
            parsedMessages = parsedMessages.map((msg: Message) => 
              msg.id === savedProgressMessageId 
                ? { 
                    ...msg, 
                    showProgress: true, 
                    isPersistentProgress: true, 
                    isProgressCancelled: true,
                    cancellationReason: "You're on the free plan, and it does not support users full auto mode"
                  }
                : msg
            );
            
            // Add a cancellation message if it doesn't already exist
            const hasCancellationMessage = parsedMessages.some((msg: Message) => 
              msg.content.includes('Task cancelled') && msg.sender === 'ai'
            );
            
            if (!hasCancellationMessage) {
              const cancellationMessage: Message = {
                id: (Date.now() + Math.random()).toString(),
                content: `Task cancelled: ${savedProgressOperation} was stopped.`,
                sender: 'ai',
                timestamp: new Date()
              };
              parsedMessages = [...parsedMessages, cancellationMessage];
            }
            
            // Save the updated messages back to localStorage
            localStorage.setItem(`fileChat-${selectedFile}`, JSON.stringify(parsedMessages));
          }
          
          setChatHistories(prev => ({
            ...prev,
            [selectedFile]: parsedMessages
          }));
        } catch (error) {
          console.error('Error loading chat history:', error);
          setChatHistories(prev => ({
            ...prev,
            [selectedFile]: []
          }));
        }
      } else if (!chatHistories[selectedFile]) {
        setChatHistories(prev => ({
          ...prev,
          [selectedFile]: []
        }));
      }
      
      // Clear the task state after handling it
      if (savedTaskState) {
        localStorage.removeItem(`fileTaskState-${selectedFile}`);
      }
      
      if (savedPrompt) {
        setPromptStates(prev => ({
          ...prev,
          [selectedFile]: savedPrompt
        }));
      } else if (!promptStates[selectedFile]) {
        setPromptStates(prev => ({
          ...prev,
          [selectedFile]: ''
        }));
      }
      
      setTimeout(() => setIsInitialLoad(false), 100);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && messages.length > 0) {
      localStorage.setItem(`fileChat-${selectedFile}`, JSON.stringify(messages));
    }
  }, [messages, selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      localStorage.setItem(`fileChatPrompt-${selectedFile}`, prompt);
    }
  }, [prompt, selectedFile]);

  // Save task state to localStorage when it changes
  useEffect(() => {
    if (selectedFile) {
      if (isTaskInProgress && currentProgressMessageId) {
        const taskState = {
          isTaskInProgress,
          currentProgressMessageId,
          progressOperation
        };
        localStorage.setItem(`fileTaskState-${selectedFile}`, JSON.stringify(taskState));
      } else {
        localStorage.removeItem(`fileTaskState-${selectedFile}`);
      }
    }
  }, [selectedFile, isTaskInProgress, currentProgressMessageId, progressOperation]);

  const setMessages = (messagesOrUpdater: Message[] | ((prev: Message[]) => Message[])) => {
    if (!selectedFile) return;
    
    setChatHistories(prev => {
      const currentMessages = prev[selectedFile] || [];
      const newMessages = typeof messagesOrUpdater === 'function' 
        ? messagesOrUpdater(currentMessages)
        : messagesOrUpdater;
      
      return {
        ...prev,
        [selectedFile]: newMessages
      };
    });
  };

  const setPrompt = (newPrompt: string) => {
    if (!selectedFile) return;
    
    setPromptStates(prev => ({
      ...prev,
      [selectedFile]: newPrompt
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleTypingComplete = () => {
      console.log('Typing animation completed, updating progress');
      if (currentProgressMessageId && selectedFile) {
        setMessages(prev => prev.map(msg => 
          msg.id === currentProgressMessageId 
            ? { ...msg, showProgress: true, isPersistentProgress: true, isProgressCompleted: true }
            : msg
        ));
        
        const completionMessage: Message = {
          id: (Date.now() + Math.random()).toString(),
          content: `Task completed: File ${progressOperation.toLowerCase()}ed successfully.`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
        
        setIsEditingDisabled(false);
        setIsTaskInProgress(false);
        
        setCurrentProgressMessageId(null);
        setProgressOperation('');
      }
    };

    const handleFileSelectionAttempt = () => {
      if (isTaskInProgress) {
        setShowUpgradePopup(true);
      }
    };

    window.addEventListener('fileTypingAnimationComplete', handleTypingComplete);
    window.addEventListener('fileSelectionAttemptDuringTask', handleFileSelectionAttempt);
    
    return () => {
      window.removeEventListener('fileTypingAnimationComplete', handleTypingComplete);
      window.removeEventListener('fileSelectionAttemptDuringTask', handleFileSelectionAttempt);
    };
  }, [currentProgressMessageId, progressOperation, selectedFile, isTaskInProgress]);

  useEffect(() => {
    const handleCancelTask = () => {
      if (canCancelTask && currentProgressMessageId && selectedFile) {
        console.log('Cancelling task - stopping at current position');
        
        // Cancel the typing animation - this will stop it where it is
        const cancelTypingEvent = new CustomEvent('cancelTypingAnimation');
        window.dispatchEvent(cancelTypingEvent);
        
        // Check if this is a manual cancel (user clicked button) or automatic (navigation/close)
        const isManualCancel = window.event?.type !== 'beforeunload';
        
        // Mark the progress as cancelled (don't complete it)
        setMessages(prev => prev.map(msg => 
          msg.id === currentProgressMessageId 
            ? { 
                ...msg, 
                showProgress: true, 
                isPersistentProgress: true, 
                isProgressCancelled: true,
                // Only show cancellation reason for automatic cancellations
                cancellationReason: isManualCancel ? undefined : "You're on the free plan, and it does not support users full auto mode"
              }
            : msg
        ));
        
        // Add a cancellation message instead of completion
        const cancellationMessage: Message = {
          id: (Date.now() + Math.random()).toString(),
          content: `Task cancelled: ${progressOperation} was stopped.`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cancellationMessage]);
        
        // Show suggested prompts only for manual cancellations and only for this specific file
        if (isManualCancel && selectedFile) {
          setFileSuggestedPrompts(prev => ({
            ...prev,
            [selectedFile]: {
              show: true,
              prompts: generateSuggestedPrompts()
            }
          }));
        }
        
        // Reset all task states
        setIsEditingDisabled(false);
        setIsTaskInProgress(false);
        setCanCancelTask(false);
        setCurrentProgressMessageId(null);
        setProgressOperation('');
        setIsLoading(false);
      }
    };

    window.addEventListener('cancelCurrentTask', handleCancelTask);
    
    return () => {
      window.removeEventListener('cancelCurrentTask', handleCancelTask);
    };
  }, [canCancelTask, currentProgressMessageId, selectedFile, progressOperation]);

  useEffect(() => {
    const event = new CustomEvent('setEditButtonDisabled', { 
      detail: { disabled: isEditingDisabled } 
    });
    window.dispatchEvent(event);
  }, [isEditingDisabled]);

  useEffect(() => {
    const event = new CustomEvent('setTaskInProgress', { 
      detail: { inProgress: isTaskInProgress } 
    });
    window.dispatchEvent(event);
  }, [isTaskInProgress]);

  const handleClose = () => {
    // Check if there's a task in progress before closing
    if (isTaskInProgress) {
      console.log('Cancelling task due to chat section closing via close button');
      
      // Cancel the typing animation first
      const cancelTypingEvent = new CustomEvent('cancelTypingAnimation');
      window.dispatchEvent(cancelTypingEvent);
      
      // Then dispatch cancellation event
      const cancelEvent = new CustomEvent('cancelCurrentTask');
      window.dispatchEvent(cancelEvent);
    }
    
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSuggestedPromptClick = (promptText: string) => {
    setPrompt(promptText);
    // Hide suggested prompts for this specific file
    if (selectedFile) {
      setFileSuggestedPrompts(prev => ({
        ...prev,
        [selectedFile]: {
          ...prev[selectedFile],
          show: false
        }
      }));
    }
    // Auto-send the message
    setTimeout(() => {
      handleSendMessage(promptText, []);
    }, 100);
  };

  const isGreeting = (message: string): boolean => {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what\'s up', 'sup'];
    const lowerMessage = message.toLowerCase().trim();
    return greetings.some(greeting => lowerMessage.startsWith(greeting) || lowerMessage === greeting);
  };

  const isBasicConversation = (message: string): boolean => {
    const conversationalPhrases = [
      'thanks', 'thank you', 'thx', 'ty',
      'bye', 'goodbye', 'see you', 'cya', 'later',
      'ok', 'okay', 'cool', 'nice', 'great',
      'yes', 'yeah', 'yep', 'no', 'nope',
      'wow', 'amazing', 'awesome', 'perfect',
      'sorry', 'my bad', 'oops'
    ];
    const lowerMessage = message.toLowerCase().trim();
    return conversationalPhrases.some(phrase => 
      lowerMessage === phrase || 
      lowerMessage.startsWith(phrase + ' ') || 
      lowerMessage.startsWith(phrase + '!')
    );
  };

  const getConversationalResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thx') || lowerMessage.includes('ty')) {
      const thankResponses = [
        "You're welcome!",
        "No problem!",
        "Happy to help!",
        "Anytime!",
        "Glad I could help!"
      ];
      return thankResponses[Math.floor(Math.random() * thankResponses.length)];
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you') || lowerMessage.includes('cya') || lowerMessage.includes('later')) {
      const goodbyeResponses = [
        "See you later!",
        "Bye! Take care!",
        "Catch you later!",
        "See ya!",
        "Later!"
      ];
      return goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
    }
    
    if (lowerMessage.includes('ok') || lowerMessage.includes('okay') || lowerMessage.includes('cool') || lowerMessage.includes('nice') || lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('amazing') || lowerMessage.includes('perfect')) {
      const positiveResponses = [
        "Awesome!",
        "Cool!",
        "Nice!",
        "Great to hear!",
        "Perfect!"
      ];
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    }
    
    if (lowerMessage === 'yes' || lowerMessage === 'yeah' || lowerMessage === 'yep') {
      const yesResponses = [
        "Got it!",
        "Alright!",
        "Cool!",
        "Sounds good!"
      ];
      return yesResponses[Math.floor(Math.random() * yesResponses.length)];
    }
    
    if (lowerMessage === 'no' || lowerMessage === 'nope') {
      const noResponses = [
        "No worries!",
        "That's fine!",
        "All good!",
        "Understood!"
      ];
      return noResponses[Math.floor(Math.random() * noResponses.length)];
    }
    
    if (lowerMessage.includes('sorry') || lowerMessage.includes('my bad') || lowerMessage.includes('oops')) {
      const sorryResponses = [
        "No worries at all!",
        "It's all good!",
        "Don't worry about it!",
        "No problem!"
      ];
      return sorryResponses[Math.floor(Math.random() * sorryResponses.length)];
    }
    
    const defaultResponses = [
      "Got it!",
      "Sounds good!",
      "Alright!",
      "Cool!"
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const isFileModificationRequest = (message: string): boolean => {
    const modificationKeywords = [
      'rewrite', 'update', 'change', 'modify', 'edit', 'improve', 'fix', 'correct',
      'simplify', 'shorten', 'expand', 'translate', 'format', 'restructure', 'add to',
      'remove from', 'delete from', 'insert', 'replace', 'convert', 'transform',
      'make', 'turn', 'adjust', 'revise', 'enhance', 'optimize', 'refactor', 'write'
    ];
    const lowerMessage = message.toLowerCase();
    return modificationKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const isSupportedFileFormat = (file: any): boolean => {
    if (!file) return false;
    
    const supportedFormats = [
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    return supportedFormats.includes(file.type);
  };

  const getOperationName = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('rewrite')) return 'Rewriting';
    if (lowerMessage.includes('translate')) return 'Translating';
    if (lowerMessage.includes('simplify') || lowerMessage.includes('shorten') || lowerMessage.includes('make') && lowerMessage.includes('smaller')) return 'Refactoring';
    if (lowerMessage.includes('expand') || lowerMessage.includes('add')) return 'Expanding';
    if (lowerMessage.includes('fix') || lowerMessage.includes('correct')) return 'Fixing';
    if (lowerMessage.includes('format') || lowerMessage.includes('restructure')) return 'Formatting';
    if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) return 'Optimizing';
    if (lowerMessage.includes('convert') || lowerMessage.includes('transform')) return 'Converting';
    
    return 'Processing';
  };

  const handleFileModification = async (userMessage: string, fileContent: string) => {
    try {
      const modificationMessages = [
        { role: 'system' as const, content: 'You are helping to modify file content based on user requests. Only return the modified content, nothing else. Do not add any explanations or formatting - just return the raw modified content.' },
        { role: 'user' as const, content: `Here is the current file content:\n\n${fileContent}\n\nUser request: ${userMessage}\n\nModify the content according to the request and return only the modified content.` }
      ];

      const modifiedContent = await ChatService.sendMessage(modificationMessages, []);

      if (file) {
        const event = new CustomEvent('updateFileContent', { 
          detail: { 
            fileId: file.id, 
            content: modifiedContent,
            animated: true
          } 
        });
        window.dispatchEvent(event);
      }

      return modifiedContent;
    } catch (error) {
      console.error('Error modifying file:', error);
      throw error;
    }
  };

  const handleSendMessage = async (userMessage: string, attachedFiles: File[]) => {
    if (!userMessage.trim()) return;

    // Hide suggested prompts when sending a message for this specific file
    if (selectedFile && currentFileSuggestedPrompts.show) {
      setFileSuggestedPrompts(prev => ({
        ...prev,
        [selectedFile]: {
          ...prev[selectedFile],
          show: false
        }
      }));
    }

    if (file && !isSupportedFileFormat(file) && isFileModificationRequest(userMessage)) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        content: userMessage,
        sender: 'user',
        timestamp: new Date(),
        files: attachedFiles.length > 0 ? attachedFiles : undefined
      };

      const unsupportedFormatMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm still in development and can't read or modify files with the ${file.type || 'this'} format. Currently, I can only work with text files (.txt, .md) and image files (.jpg, .png, .gif, .webp, .svg). Please upload a supported file format to get assistance with file modifications.`,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newUserMessage, unsupportedFormatMessage]);
      
      if (selectedFile) {
        const newBlockedChats = new Set(blockedFileChats).add(selectedFile);
        setBlockedFileChats(newBlockedChats);
      }
      
      return;
    }

    let contextualMessage = userMessage;
    if (file && attachedFiles.length > 0) {
      contextualMessage = `Regarding the file "${file.name}" and the uploaded files, ${userMessage}`;
    } else if (file) {
      contextualMessage = `Regarding the file "${file.name}", ${userMessage}`;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? attachedFiles : undefined
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      let aiResponse = '';

      if (isGreeting(userMessage)) {
        const greetingResponses = [
          "Hey! What's up?",
          "Hi there! How can I help?",
          "Hello! What do you need?",
          "Hey! Ready to help you out.",
          "Hi! What can I do for you?",
          "Hello! How's it going?",
          "Hey there! Good to see you!"
        ];
        aiResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      else if (isBasicConversation(userMessage)) {
        aiResponse = getConversationalResponse(userMessage);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      else if (file && file.content && (file.type === 'text/plain' || file.type === 'text/markdown') && isFileModificationRequest(userMessage)) {
        const operationName = getOperationName(userMessage);
        
        setIsTaskInProgress(true);
        setIsEditingDisabled(true);
        setCanCancelTask(true);
        
        const explanationMessages = [
          `Got it! I'll update your file now.`,
          `Sure thing! Let me work on that for you.`,
          `On it! I'll make those changes.`,
          `Perfect! Let me handle that.`,
          `Absolutely! I'll take care of that.`,
          `You got it! Working on it now.`
        ];
        const explanationMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: explanationMessages[Math.floor(Math.random() * explanationMessages.length)],
          sender: 'ai',
          timestamp: new Date(),
          showProgress: true,
          progressOperation: operationName,
          isPersistentProgress: false
        };
        
        setCurrentProgressMessageId(explanationMessage.id);
        setProgressOperation(operationName);
        
        setMessages(prev => [...prev, explanationMessage]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await handleFileModification(contextualMessage, file.content);
          
        } catch (error) {
          setMessages(prev => prev.map(msg => 
            msg.id === explanationMessage.id 
              ? { ...msg, showProgress: false }
              : msg
          ));
          
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: "Hmm, ran into an issue there. Mind trying again?",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          
          setIsEditingDisabled(false);
          setIsTaskInProgress(false);
          setCanCancelTask(false);
          setCurrentProgressMessageId(null);
          setProgressOperation('');
        }
      }
      else {
        setIsLoading(true);
        setCanCancelTask(true);
        
        const fileAttachments = [];
        
        if (file) {
          if ((file.type === 'text/plain' || file.type === 'text/markdown') && file.content) {
            fileAttachments.push({
              name: file.name,
              type: file.type,
              content: file.content
            });
          } else if (file.type.startsWith('image/') && file.dataUrl) {
            fileAttachments.push({
              name: file.name,
              type: file.type,
              content: file.dataUrl
            });
          }
        }

        for (const attachedFile of attachedFiles) {
          if (attachedFile.type === 'text/plain') {
            const text = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string || '');
              reader.readAsText(attachedFile);
            });
            fileAttachments.push({
              name: attachedFile.name,
              type: attachedFile.type,
              content: text
            });
          } else if (attachedFile.type.startsWith('image/')) {
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string || '');
              reader.readAsDataURL(attachedFile);
            });
            fileAttachments.push({
              name: attachedFile.name,
              type: attachedFile.type,
              content: dataUrl
            });
          }
        }

        const chatMessages = [
          { role: 'system' as const, content: 'You are a helpful assistant. Be super casual and friendly - talk like you\'re texting a good friend. Keep it short, natural, and conversational. Use contractions, be warm, and speak in a relaxed tone. Avoid being formal or wordy.' },
          ...messages.slice(-5).map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          { role: 'user' as const, content: contextualMessage }
        ];

        aiResponse = await ChatService.sendMessage(chatMessages, fileAttachments);
        
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setCanCancelTask(false);
      }
    } catch (error) {
      console.error('❌ Chat API error:', error);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Oops, something went wrong. Check your API keys in settings?`,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setCanCancelTask(false);
    } finally {
      setIsLoading(false);
      setPrompt('');
      setUploadedFiles([]);
    }
  };

  const showCenterPrompts = messages.length === 0 && selectedFile && !isLoading && !showProgress;

  const isChatBlocked = selectedFile ? blockedFileChats.has(selectedFile) : false;

  return (
    <div 
      className={`w-full bg-[#0e0e0e] border-l border-[#1C1C1C] flex flex-col h-full transition-all duration-300 ease-out ${
        isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
      }`}
    >
      <ChatHeader onClose={handleClose} />
      
      <ChatMessages 
        messages={messages} 
        isLoading={isLoading}
        showProgress={showProgress}
        progressOperation={progressOperation}
        isInitialLoad={isInitialLoad}
        showCenterPrompts={showCenterPrompts}
        centerPrompts={centerPrompts}
        onCenterPromptClick={handleSuggestedPromptClick}
      />
      
      <ChatInput 
        selectedFile={selectedFile}
        prompt={prompt}
        setPrompt={setPrompt}
        setMessages={setMessages}
        setIsLoading={setIsLoading}
        uploadedFiles={uploadedFiles}
        handleRemoveFile={handleRemoveFile}
        handleFilePreview={handleFilePreview}
        attachPopoverOpen={attachPopoverOpen}
        setAttachPopoverOpen={setAttachPopoverOpen}
        handleAttachMenuClick={handleAttachMenuClick}
        modelPopoverOpen={modelPopoverOpen}
        setModelPopoverOpen={setModelPopoverOpen}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        onSendMessage={handleSendMessage}
        canCancelTask={canCancelTask}
        isTaskInProgress={isTaskInProgress || isLoading}
        isChatBlocked={isChatBlocked}
        showSuggestedPrompts={currentFileSuggestedPrompts.show}
        suggestedPrompts={currentFileSuggestedPrompts.prompts}
        onSuggestedPromptClick={handleSuggestedPromptClick}
      />

      <FilePreviewModal
        previewFile={previewFile}
        onClose={() => setPreviewFile(null)}
      />
      
      <TxtPreviewModal
        previewFile={txtPreviewFile}
        onClose={() => setTxtPreviewFile(null)}
      />

      <TextContentDialog
        isOpen={textContentDialogOpen}
        onClose={() => setTextContentDialogOpen(false)}
        onSave={handleTextContentSave}
      />

      <UpgradePopup
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
      />
    </div>
  );
};

export default FileChatSection;
