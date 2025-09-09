import { MessageSquare, MoreVertical, Edit2, Trash2, Pin, Check, X } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Link, useLocation } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SidebarHistorySectionProps {
  isOpen: boolean;
}

const SidebarHistorySection = ({ isOpen }: SidebarHistorySectionProps) => {
  const location = useLocation();
  const { chats, updateChatTitle, deleteChat, togglePinChat } = useChat();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Get the current chat ID from the URL
  const getCurrentChatId = () => {
    const match = location.pathname.match(/^\/chat\/(.+)$/);
    return match ? match[1] : null;
  };

  // Get pinned chats
  const getPinnedChats = () => {
    return chats.filter(chat => chat.isPinned);
  };

  // Get unpinned chats for history section
  const getUnpinnedChats = () => {
    const currentChatId = getCurrentChatId();
    const unpinnedChats = chats.filter(chat => !chat.isPinned);
    
    if (!currentChatId) {
      return unpinnedChats.slice(0, 5);
    }

    const currentChat = unpinnedChats.find(chat => chat.id === currentChatId);
    const otherChats = unpinnedChats.filter(chat => chat.id !== currentChatId);
    
    const sortedChats = currentChat ? [currentChat, ...otherChats] : unpinnedChats;
    return sortedChats.slice(0, 5);
  };

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
    setOpenPopover(null);
  };

  const handleSaveEdit = () => {
    if (editingTitle.trim() && editingChatId) {
      updateChatTitle(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleDelete = (chatId: string) => {
    deleteChat(chatId);
    setOpenPopover(null);
  };

  const handlePin = (chatId: string) => {
    togglePinChat(chatId);
    setOpenPopover(null);
  };

  const handleMoreClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenPopover(openPopover === chatId ? null : chatId);
  };

  const renderChatItem = (chat: any) => (
    <ContextMenu key={chat.id}>
      <ContextMenuTrigger asChild>
        <div className="relative group">
          {editingChatId === chat.id ? (
            <div className="flex items-center gap-1 text-white font-nunito rounded-lg border border-[#4b4b4b] bg-white/10 text-sm px-3 py-[10px] h-[38px]">
              <MessageSquare className="w-5 h-5 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] flex-shrink-0" />
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white min-w-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 hover:bg-white/10 rounded flex-shrink-0 transition-colors"
                style={{ border: 'none', background: 'transparent' }}
              >
                <Check className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-white/10 rounded flex-shrink-0 transition-colors"
                style={{ border: 'none', background: 'transparent' }}
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          ) : (
            <>
              <Link
                to={`/chat/${chat.id}`}
                className={`
                  flex items-center gap-3 text-white font-nunito
                  hover:bg-transparent hover:border hover:border-[#4b4b4b]
                  rounded-lg transition-all duration-200
                  relative border border-transparent
                  text-sm px-3 py-[10px] h-[38px] truncate pr-10
                  ${location.pathname === `/chat/${chat.id}` ? 'bg-white/10 border-[#4b4b4b]' : ''}
                `}
                title={chat.title}
              >
                <MessageSquare className={`
                  text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)]
                  hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)]
                  hover:filter hover:brightness-150
                  transition-all duration-200
                  w-5 h-5
                  ${location.pathname === `/chat/${chat.id}` ? 'brightness-150' : ''}
                `} />
                <span className="font-nunito text-sm font-medium truncate">
                  {chat.title}
                </span>
              </Link>
              
              <Popover open={openPopover === chat.id} onOpenChange={(open) => setOpenPopover(open ? chat.id : null)}>
                <PopoverTrigger asChild>
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded"
                    onClick={(e) => handleMoreClick(e, chat.id)}
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </PopoverTrigger>
                
                <PopoverContent 
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="p-0 shadow-xl"
                  style={{
                    borderRadius: '16px',
                    background: '#131313',
                    width: '180px',
                    border: 'none'
                  }}
                >
                  <div className="py-2 px-2">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616]"
                      onClick={() => handleStartEdit(chat.id, chat.title)}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Rename</span>
                    </button>
                    
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616]"
                      onClick={() => handlePin(chat.id)}
                    >
                      <Pin className="w-4 h-4" />
                      <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-400 transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616]"
                      onClick={() => handleDelete(chat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#131313] border-gray-700">
        <ContextMenuItem 
          className="flex items-center gap-2 text-white hover:bg-gray-700 cursor-pointer"
          onClick={() => handleStartEdit(chat.id, chat.title)}
        >
          <Edit2 className="w-4 h-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem 
          className="flex items-center gap-2 text-red-400 hover:bg-gray-700 cursor-pointer"
          onClick={() => handleDelete(chat.id)}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  // Don't render if sidebar is closed or no chats
  if (!isOpen || chats.length === 0) {
    return null;
  }

  const pinnedChats = getPinnedChats();
  const unpinnedChats = getUnpinnedChats();

  return (
    <>
      <div className="px-4 mb-4">
        <Separator className="bg-[#1C1C1C]" />
      </div>
      
      {pinnedChats.length > 0 && (
        <>
          <div className="px-4 mb-3">
            <h3 className="text-gray-400 font-nunito text-xs font-semibold uppercase tracking-wider">
              Pinned
            </h3>
          </div>
          <nav className="px-3 space-y-2 mb-4">
            {pinnedChats.map(renderChatItem)}
          </nav>
        </>
      )}
      
      <div className="px-4 mb-3">
        <h3 className="text-gray-400 font-nunito text-xs font-semibold uppercase tracking-wider">
          History
        </h3>
      </div>
      <nav className="px-3 space-y-2">
        {unpinnedChats.map(renderChatItem)}
      </nav>
    </>
  );
};

export default SidebarHistorySection;
