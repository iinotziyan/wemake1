import { Home, MessageCircle, FolderOpen, Calendar, ListTodo, Plus, AtSign, FileText, History, ChevronDown, ChevronRight, MoreVertical, Edit2, Trash2, Pin, Check, X, StickyNote, CheckSquare, Mail, ScrollText, FileIcon } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { useRef, useState, useEffect } from 'react';
import { saveRecentFile } from '../../services/fileService';
import { useChat } from '../../contexts/ChatContext';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
interface SidebarNavigationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const SidebarNavigation = ({
  isOpen,
  setIsOpen
}: SidebarNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    chats,
    updateChatTitle,
    deleteChat,
    togglePinChat
  } = useChat();
  // Load persistent state from localStorage
  const [showHistory, setShowHistory] = useState(() => {
    const saved = localStorage.getItem('sidebar-show-history');
    return saved ? JSON.parse(saved) : false;
  });
  const [showMore, setShowMore] = useState(() => {
    const saved = localStorage.getItem('sidebar-show-more');
    return saved ? JSON.parse(saved) : false;
  });
  const [showPages, setShowPages] = useState(() => {
    const saved = localStorage.getItem('sidebar-show-pages');
    return saved ? JSON.parse(saved) : false;
  });
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
const [openPopover, setOpenPopover] = useState<string | null>(null);
const [pendingExpand, setPendingExpand] = useState<string | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-show-history', JSON.stringify(showHistory));
  }, [showHistory]);

  useEffect(() => {
    localStorage.setItem('sidebar-show-more', JSON.stringify(showMore));
  }, [showMore]);

  useEffect(() => {
    localStorage.setItem('sidebar-show-pages', JSON.stringify(showPages));
  }, [showPages]);

  // When opening sidebar from collapsed icon, expand the intended section
  useEffect(() => {
    if (isOpen && pendingExpand) {
      setTimeout(() => {
        if (pendingExpand === 'history') setShowHistory(true);
        if (pendingExpand === 'more') setShowMore(true);
        if (pendingExpand === 'pages') setShowPages(true);
        if (pendingExpand === 'today') {
          navigate('/testings1');
        }
        setPendingExpand(null);
      }, 150); // Small delay to ensure sidebar animation completes
    }
  }, [isOpen, pendingExpand, navigate]);

  // More section links
  const moreLinks = [
    { name: 'Notes', icon: StickyNote, href: '/notes' },
    { name: 'To dos', icon: CheckSquare, href: '/todos' },
    { name: 'Tasks', icon: ListTodo, href: '/tasks' },
    { name: 'Summaries', icon: ScrollText, href: '/summaries' },
    { name: 'Emails', icon: Mail, href: '/emails' },
  ];

  // Pages section links
  const pagesLinks = [
    { name: 'About', icon: FileIcon, href: '/about' },
    { name: 'Contact', icon: Mail, href: '/contact' },
    { name: 'Privacy', icon: FileText, href: '/privacy' },
    { name: 'Terms', icon: ScrollText, href: '/terms' },
  ];
  const mainLinks = [{
    name: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  }, {
    name: 'Chat',
    icon: MessageCircle,
    href: '/chatmode'
  }, {
    name: 'Files',
    icon: FolderOpen,
    href: '/files'
  }, {
    name: 'Today',
    icon: Calendar,
    href: '/testings1'
  }];
  const shouldShowPlusIcon = (linkName: string) => {
    return ['Tasks', 'Files', 'Today'].includes(linkName);
  };
  const shouldShowCtrlJ = (linkName: string) => {
    return linkName === 'Chat';
  };
  const getLinkHoverClass = (linkName: string) => {
    if (shouldShowPlusIcon(linkName) || shouldShowCtrlJ(linkName)) {
      return isOpen ? 'hover:bg-white/10 group' : 'hover:bg-white/10 group';
    }
    return isOpen ? 'hover:bg-white/10' : 'hover:bg-white/10';
  };
  const isActive = (href: string) => location.pathname === href;
  const isChatModeActive = (linkName: string) => {
    if (linkName === 'Chat') {
      if (!isOpen) {
        // When sidebar is closed, show Chat as active for both /chatmode and /chat pages
        return location.pathname === '/chatmode' || location.pathname.startsWith('/chat/');
      } else {
        // When sidebar is open, only show Chat as active for /chatmode page
        return location.pathname === '/chatmode';
      }
    }
    return false;
  };

  // Fix 4: Handle file upload for Files plus icon
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      for (let i = 0; i < uploadedFiles.length; i++) {
        await saveRecentFile(uploadedFiles[i]);
      }
      // Navigate to files page after upload
      navigate('/files');
      // Trigger files updated event
      window.dispatchEvent(new CustomEvent('recentFilesUpdated'));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handlePlusClick = (linkName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (linkName === 'ChatMode') {
      navigate('/chatmode');
    } else if (linkName === 'Files') {
      // Trigger file upload
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else if (linkName === 'Today') {
      // Handle Today plus click action here
      console.log('Today plus clicked');
    }
  };

  // Chat history functions
  const getCurrentChatId = () => {
    const match = location.pathname.match(/^\/chat\/(.+)$/);
    return match ? match[1] : null;
  };
  const getPinnedChats = () => {
    return chats.filter(chat => chat.isPinned);
  };
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
  const renderChatItem = (chat: any) => <ContextMenu key={chat.id}>
      <ContextMenuTrigger asChild>
        <div className="relative group">
           {editingChatId === chat.id ? <div className="flex items-center gap-1 text-white font-nunito rounded-lg border border-[#4b4b4b] bg-white/10 text-sm px-3 py-[10px] h-[38px] ml-8">
                <MessageCircle className="w-5 h-5 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] flex-shrink-0" />
               <input type="text" value={editingTitle} onChange={e => setEditingTitle(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white min-w-0" autoFocus onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSaveEdit();
            } else if (e.key === 'Escape') {
              handleCancelEdit();
            }
          }} />
               <button onClick={handleSaveEdit} className="p-1 hover:bg-white/10 rounded flex-shrink-0 transition-colors" style={{
            border: 'none',
            background: 'transparent'
          }}>
                 <Check className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
               </button>
               <button onClick={handleCancelEdit} className="p-1 hover:bg-white/10 rounded flex-shrink-0 transition-colors" style={{
            border: 'none',
            background: 'transparent'
          }}>
                 <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
               </button>
             </div> : <>
               <Link to={`/chat/${chat.id}`} className={`
                   flex items-center gap-3 text-white font-nunito
                   hover:bg-white/10
                   rounded-lg transition-all duration-200
                   relative border border-transparent
                   text-sm px-3 py-[10px] h-[38px] truncate pr-6 ml-8
                   ${location.pathname === `/chat/${chat.id}` ? 'bg-white/10 border-[#4b4b4b]' : ''}
                 `} title={chat.title}>
                 <MessageCircle className={`
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
              
              <Popover open={openPopover === chat.id} onOpenChange={open => setOpenPopover(open ? chat.id : null)}>
                 <PopoverTrigger asChild>
                   <button className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded" onClick={e => handleMoreClick(e, chat.id)} style={{
                border: 'none',
                background: 'transparent'
              }}>
                     <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                   </button>
                 </PopoverTrigger>
                
                <PopoverContent side="right" align="start" sideOffset={8} className="p-0 shadow-xl" style={{
              borderRadius: '16px',
              background: '#131313',
              width: '180px',
              border: 'none'
            }}>
                  <div className="py-2 px-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616]" onClick={() => handleStartEdit(chat.id, chat.title)}>
                      <Edit2 className="w-4 h-4" />
                      <span>Rename</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616]" onClick={() => handlePin(chat.id)}>
                      <Pin className="w-4 h-4" />
                      <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-400 transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#161616]" onClick={() => handleDelete(chat.id)}>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </>}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#131313] border-gray-700">
        <ContextMenuItem className="flex items-center gap-2 text-white hover:bg-gray-700 cursor-pointer" onClick={() => handleStartEdit(chat.id, chat.title)}>
          <Edit2 className="w-4 h-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem className="flex items-center gap-2 text-red-400 hover:bg-gray-700 cursor-pointer" onClick={() => handleDelete(chat.id)}>
          <Trash2 className="w-4 h-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>;
  // Handle collapsible section clicks when sidebar is closed
  const handleCollapsibleClick = (section: string) => {
    if (!isOpen) {
      setPendingExpand(section);
      setIsOpen(true);
    } else {
      if (section === 'history') setShowHistory((v) => !v);
      if (section === 'more') setShowMore((v) => !v);
      if (section === 'pages') setShowPages((v) => !v);
      if (section === 'today') {
        navigate('/testings1');
      }
    }
  };
  return <TooltipProvider>
      {/* Hidden file input for Files upload */}
      <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.xlsx,.json" />

      {/* Main Navigation Links */}
      <nav className={`px-3 space-y-2 ${!isOpen ? 'mt-4' : ''}`}>
        {mainLinks.map((link, index) => <div key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={link.href} className={`
                    flex items-center gap-3 text-white font-nunito
                    ${getLinkHoverClass(link.name)} rounded-lg transition-all duration-200
                    relative border border-transparent
                    ${isOpen ? 'text-sm px-3 py-[10px] h-[38px] w-[229px]' : 'justify-center px-3 py-3'}
                    ${isActive(link.href) || isChatModeActive(link.name) ? 'bg-white/10 border-[#4b4b4b]' : ''}
                  `}>
                  <link.icon className={`
                      text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)]
                      hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)]
                      hover:filter hover:brightness-150
                      transition-all duration-200
                      ${isOpen ? 'w-5 h-5' : 'w-4 h-4 hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]'}
                      ${isActive(link.href) || isChatModeActive(link.name) ? 'brightness-150' : ''}
                    `} />
                  {isOpen && <span className="font-nunito text-sm font-semibold">
                      {link.name}
                    </span>}
                  {shouldShowPlusIcon(link.name) && isOpen && <Plus className="
                        w-3 h-3 text-white ml-auto opacity-0 group-hover:opacity-100
                        drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]
                        group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]
                        transition-all duration-300 ease-in-out
                        hover:scale-110 hover:rotate-90 hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]
                        group-hover/plus:bg-transparent cursor-pointer
                      " onClick={e => handlePlusClick(link.name, e)} />}
                  {shouldShowCtrlJ(link.name) && isOpen && <span className="
                        text-xs text-gray-400 ml-auto opacity-0 group-hover:opacity-100
                        transition-all duration-300 ease-in-out font-mono tracking-wider
                      ">CTRL+J</span>}
                </Link>
              </TooltipTrigger>
              {!isOpen && <TooltipContent side="right" className="bg-[#1a1a1a] border border-gray-700 text-white shadow-lg">
                  {link.name}
                </TooltipContent>}
            </Tooltip>
          </div>)}
      </nav>

      {/* Show collapsible sections as icons when sidebar is closed */}
      {!isOpen && (
        <nav className="px-3 mt-4 space-y-2">

          {/* Pages Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleCollapsibleClick('pages')}
                className="flex items-center justify-center w-full px-3 py-3 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <FileText className="w-4 h-4 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)] hover:filter hover:brightness-150 transition-all duration-200" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1a] border border-gray-700 text-white shadow-lg">
              Pages
            </TooltipContent>
          </Tooltip>

          {/* History Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleCollapsibleClick('history')}
                className="flex items-center justify-center w-full px-3 py-3 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <History className="w-4 h-4 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)] hover:filter hover:brightness-150 transition-all duration-200" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1a] border border-gray-700 text-white shadow-lg">
              History
            </TooltipContent>
          </Tooltip>

          {/* More Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleCollapsibleClick('more')}
                className="flex items-center justify-center w-full px-3 py-3 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <AtSign className="w-4 h-4 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)] hover:filter hover:brightness-150 transition-all duration-200" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1a] border border-gray-700 text-white shadow-lg">
              More
            </TooltipContent>
          </Tooltip>
        </nav>
      )}

      {/* Pages Section - Show below Today when sidebar is open */}
      {isOpen && (
        <>          
          <nav className="px-3 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowPages(!showPages)} 
                  className="flex items-center gap-3 text-white font-nunito hover:bg-white/10 rounded-lg transition-all duration-200 relative border border-transparent text-sm px-3 py-[10px] h-[38px] w-[229px] group"
                >
                  <div className="relative w-5 h-5">
                    {/* Pages icon - visible by default, hidden on hover */}
                    <FileText className="absolute inset-0 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)] hover:filter hover:brightness-150 transition-all duration-200 w-5 h-5 group-hover:opacity-0 group-hover:scale-75" />
                    
                    {/* Chevron icon - hidden by default, visible on hover */}
                    <div className={`absolute inset-0 transition-all duration-200 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 ${showPages ? 'rotate-90' : 'rotate-0'}`}>
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="font-nunito text-sm font-bold">Pages</span>
                </button>
              </TooltipTrigger>
            </Tooltip>
          </nav>

          {/* Pages Items */}
          {showPages && (
            <div className="relative">
              {/* Single vertical line that extends with content */}
              <div className="absolute left-[34px] top-0 bottom-0 w-px bg-gray-600/50 z-0"></div>
              
              <nav className="px-3 space-y-2 mb-4">
                {pagesLinks.map((link, index) => (
                  <div key={index} className="relative z-10">
                    <Link 
                      to={link.href} 
                      className={`
                        flex items-center gap-3 text-white font-nunito
                        hover:bg-white/10
                        rounded-lg transition-all duration-200
                        relative border border-transparent
                        text-sm px-3 py-[10px] h-[38px] truncate ml-8
                        ${isActive(link.href) ? 'bg-white/10 border-[#4b4b4b]' : ''}
                      `}
                    >
                      <link.icon className={`
                        text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)]
                        hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)]
                        hover:filter hover:brightness-150
                        transition-all duration-200
                        w-5 h-5
                        ${isActive(link.href) ? 'brightness-150' : ''}
                      `} />
                      <span className="font-nunito text-sm font-medium truncate">
                        {link.name}
                      </span>
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
          )}
        </>
      )}

      {/* History Section - Always show when sidebar is open */}
      {isOpen && <>          
          <nav className="px-3 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-3 text-white font-nunito hover:bg-white/10 rounded-lg transition-all duration-200 relative border border-transparent text-sm px-3 py-[10px] h-[38px] w-[229px] group">
                  <div className="relative w-5 h-5">
                    {/* History icon - visible by default, hidden on hover when there are chats */}
                    <History className={`absolute inset-0 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)] hover:filter hover:brightness-150 transition-all duration-200 w-5 h-5 ${chats.length > 0 ? 'group-hover:opacity-0 group-hover:scale-75' : ''}`} />
                    
                    {/* Chevron icon - hidden by default, visible on hover when there are chats */}
                    {chats.length > 0 && <div className={`absolute inset-0 transition-all duration-200 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 ${showHistory ? 'rotate-90' : 'rotate-0'}`}>
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>}
                  </div>
                  <span className="font-nunito text-sm font-bold">History</span>
                </button>
              </TooltipTrigger>
            </Tooltip>
          </nav>

           {/* Chat History Items */}
           {showHistory && chats.length > 0 && <div className="relative">
                {/* Single vertical line that extends with content */}
                <div className="absolute left-[34px] top-0 bottom-0 w-px bg-gray-600/50 z-0"></div>
               
               {getPinnedChats().length > 0 && <>
                   <div className="px-4 mb-3 mt-3 relative z-10">
                      <h4 className="text-gray-400 font-nunito text-xs font-semibold uppercase tracking-wider ml-8">
                        Pinned
                      </h4>
                   </div>
                   <nav className="px-3 space-y-2 mb-4">
                     {getPinnedChats().map((chat, index) => <div key={chat.id} className="relative z-10">
                         {renderChatItem(chat)}
                       </div>)}
                   </nav>
                 </>}
               
               {getUnpinnedChats().length > 0 && <>
                   <div className="px-4 mb-3 relative z-10">
                      <h4 className="text-gray-400 font-nunito text-xs font-semibold uppercase tracking-wider ml-8">
                        Recent
                      </h4>
                   </div>
                   <nav className="px-3 space-y-2">
                     {getUnpinnedChats().map((chat, index) => <div key={chat.id} className="relative z-10">
                         {renderChatItem(chat)}
                       </div>)}
                   </nav>
                 </>}
             </div>}

          {/* Show empty state when no chats and history is expanded */}
          {showHistory && chats.length === 0 && <div className="px-7 py-4">
              <p className="text-gray-500 text-sm font-nunito">No chat history yet</p>
            </div>}
         </>}

      {/* More Section - Show below History when sidebar is open */}
      {isOpen && (
        <>          
          <nav className="px-3 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowMore(!showMore)} 
                  className="flex items-center gap-3 text-white font-nunito hover:bg-white/10 rounded-lg transition-all duration-200 relative border border-transparent text-sm px-3 py-[10px] h-[38px] w-[229px] group"
                >
                  <div className="relative w-5 h-5">
                    {/* @ icon - visible by default, hidden on hover */}
                    <AtSign className="absolute inset-0 text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)] hover:filter hover:brightness-150 transition-all duration-200 w-5 h-5 group-hover:opacity-0 group-hover:scale-75" />
                    
                    {/* Chevron icon - hidden by default, visible on hover */}
                    <div className={`absolute inset-0 transition-all duration-200 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 ${showMore ? 'rotate-90' : 'rotate-0'}`}>
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="font-nunito text-sm font-bold">More</span>
                </button>
              </TooltipTrigger>
            </Tooltip>
          </nav>

          {/* More Items */}
          {showMore && (
            <div className="relative">
              {/* No vertical line for More section */}
              
              <nav className="px-3 space-y-2 mb-4">
                {moreLinks.map((link, index) => (
                  <div key={index} className="relative z-10">
                    <Link 
                      to={link.href} 
                      className={`
                        flex items-center gap-3 text-white font-nunito
                        hover:bg-white/10
                        rounded-lg transition-all duration-200
                        relative border border-transparent
                        text-sm px-3 py-[10px] h-[38px] truncate ml-8
                        ${isActive(link.href) ? 'bg-white/10 border-[#4b4b4b]' : ''}
                      `}
                    >
                      <link.icon className={`
                        text-white drop-shadow-[0_4px_8px_rgba(255,255,255,0.3)]
                        hover:drop-shadow-[0_6px_12px_rgba(255,255,255,1)]
                        hover:filter hover:brightness-150
                        transition-all duration-200
                        w-5 h-5
                        ${isActive(link.href) ? 'brightness-150' : ''}
                      `} />
                      <span className="font-nunito text-sm font-medium truncate">
                        {link.name}
                      </span>
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
          )}
        </>
      )}

    </TooltipProvider>;
};
export default SidebarNavigation;