import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import ChatModeHeader from '../components/chatmode/ChatModeHeader';
import PromptIdeasGrid from '../components/chatmode/PromptIdeasGrid';
import FilePreviewModal from '../components/chatmode/FilePreviewModal';
import TxtPreviewModal from '../components/chatmode/TxtPreviewModal';
import TextContentDialog from '../components/chatmode/TextContentDialog';
import ChatInputArea from '../components/chatmode/ChatInputArea';
import { useFileHandling } from '../components/chatmode/FileHandling';
import { usePromptHandling } from '../components/chatmode/PromptHandling';
import { usePopoverHandling } from '../components/chatmode/PopoverHandling';
import { useModalHandling } from '../components/chatmode/ModalHandling';
const ChatMode = () => {
  const navigate = useNavigate();
  const {
    addChat
  } = useChat();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const {
    prompt,
    setPrompt,
    handlePromptClick,
    handleTextareaChange
  } = usePromptHandling();
  const {
    attachPopoverOpen,
    setAttachPopoverOpen,
    modelPopoverOpen,
    setModelPopoverOpen,
    handleModelMenuClick
  } = usePopoverHandling();
  const {
    previewFile,
    setPreviewFile,
    txtPreviewFile,
    setTxtPreviewFile,
    textContentDialogOpen,
    setTextContentDialogOpen,
    closePreview,
    closeTxtPreview
  } = useModalHandling();
  const {
    fileInputRef,
    serializeFileData,
    handleFileChange,
    handleRemoveFile,
    handleFilePreview,
    handleAttachMenuClick,
    handleTextContentSave
  } = useFileHandling({
    uploadedFiles,
    setUploadedFiles,
    setPreviewFile,
    setTxtPreviewFile,
    setAttachPopoverOpen,
    setTextContentDialogOpen
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const chatId = addChat(prompt);
    localStorage.setItem(`chat-${chatId}-initial`, prompt);
    if (uploadedFiles.length > 0) {
      try {
        const filesData = await Promise.all(uploadedFiles.map(file => serializeFileData(file)));
        localStorage.setItem(`chat-${chatId}-files`, JSON.stringify(filesData));
      } catch (error) {
        console.error('Error serializing files:', error);
      }
    }
    navigate(`/chat/${chatId}`);
  };
  return <div className="min-h-screen text-white p-4 md:p-8 flex items-center justify-center bg-[#161618]">
      <div className="max-w-4xl w-full">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx" multiple style={{
        display: 'none'
      }} />

        <FilePreviewModal previewFile={previewFile} onClose={closePreview} />

        <TxtPreviewModal previewFile={txtPreviewFile} onClose={closeTxtPreview} />

        <TextContentDialog isOpen={textContentDialogOpen} onClose={() => setTextContentDialogOpen(false)} onSave={handleTextContentSave} />

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-orbitron font-bold text-white">Kairo</h1>
        </div>

        <ChatInputArea prompt={prompt} onPromptChange={handleTextareaChange} onSubmit={handleSubmit} uploadedFiles={uploadedFiles} onRemoveFile={handleRemoveFile} onFilePreview={handleFilePreview} attachPopoverOpen={attachPopoverOpen} onAttachPopoverChange={setAttachPopoverOpen} onAttachMenuClick={handleAttachMenuClick} modelPopoverOpen={modelPopoverOpen} onModelPopoverChange={setModelPopoverOpen} onModelMenuClick={handleModelMenuClick} />
      </div>
    </div>;
};
export default ChatMode;