
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, Clock } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import FilePreviewModal from '../components/chatmode/FilePreviewModal';
import TxtPreviewModal from '../components/chatmode/TxtPreviewModal';
import TextContentDialog from '../components/chatmode/TextContentDialog';
import ChatContainer from '../components/chat/ChatContainer';
import ChatInputSection from '../components/chat/ChatInputSection';
import { useFileHandling } from '../components/chatmode/FileHandling';
import { usePopoverHandling } from '../components/chatmode/PopoverHandling';
import { useModalHandling } from '../components/chatmode/ModalHandling';
import { useMessageHandling } from '../components/chat/MessageHandling';
import { useChatInputHandling } from '../components/chat/ChatInputHandling';

const Chat = () => {
  const { chatId } = useParams();
  const { getChatMessages, updateChatMessages, updateChatTitle } = useChat();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [customInstructionEnabled, setCustomInstructionEnabled] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);

  const {
    attachPopoverOpen,
    setAttachPopoverOpen,
    modelPopoverOpen,
    setModelPopoverOpen,
  } = usePopoverHandling();

  const {
    previewFile,
    setPreviewFile,
    txtPreviewFile,
    setTxtPreviewFile,
    textContentDialogOpen,
    setTextContentDialogOpen,
    closePreview,
    closeTxtPreview,
  } = useModalHandling();

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

  const { messages, addMessage } = useMessageHandling({
    chatId,
    getChatMessages,
    updateChatMessages,
    updateChatTitle,
  });

  const {
    prompt,
    handleSubmit,
    handleTextareaChange,
    handleKeyDown,
    isLoading,
  } = useChatInputHandling({
    messages,
    addMessage,
    uploadedFiles,
    setUploadedFiles,
    chatId,
    updateChatTitle,
  });

  const attachMenuItems = [
    { icon: Upload, label: 'Upload a file' },
    { icon: FileText, label: 'Add Text Content' },
    { icon: Clock, label: 'Recents' },
  ];

  const handleCustomInstructionToggle = () => {
    setCustomInstructionEnabled(!customInstructionEnabled);
  };

  const handleSearchToggle = () => {
    setSearchEnabled(!searchEnabled);
  };

  return (
    <div className="h-screen bg-[#0b0b0b] text-white flex flex-col overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        multiple
        style={{ display: 'none' }}
      />

      <FilePreviewModal 
        previewFile={previewFile} 
        onClose={closePreview} 
      />

      <TxtPreviewModal 
        previewFile={txtPreviewFile} 
        onClose={closeTxtPreview} 
      />

      <TextContentDialog
        isOpen={textContentDialogOpen}
        onClose={() => setTextContentDialogOpen(false)}
        onSave={handleTextContentSave}
      />

      {/* Scrollable chat container */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer
          messages={messages}
          onFilePreview={handleFilePreview}
          isLoading={isLoading}
        />
      </div>

      {/* Fixed input section */}
      <div className="flex-shrink-0">
        <ChatInputSection
          prompt={prompt}
          uploadedFiles={uploadedFiles}
          attachPopoverOpen={attachPopoverOpen}
          modelPopoverOpen={modelPopoverOpen}
          customInstructionEnabled={customInstructionEnabled}
          searchEnabled={searchEnabled}
          isLoading={isLoading}
          onPromptChange={handleTextareaChange}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          onRemoveFile={handleRemoveFile}
          onFilePreview={handleFilePreview}
          onAttachPopoverChange={setAttachPopoverOpen}
          onModelPopoverChange={setModelPopoverOpen}
          onAttachMenuClick={handleAttachMenuClick}
          onCustomInstructionToggle={handleCustomInstructionToggle}
          onSearchToggle={handleSearchToggle}
          attachMenuItems={attachMenuItems}
        />
      </div>
    </div>
  );
};

export default Chat;
