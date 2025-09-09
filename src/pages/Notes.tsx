import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Pencil, Star, Trash2, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebarContext } from '@/contexts/SidebarContext';

interface Note {
  id: string;
  color: string;
  content: string;
  createdAt: string;
  important: boolean;
}

const Notes = () => {
  const [isRotated, setIsRotated] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [currentView, setCurrentView] = useState<'all' | 'important' | 'deleted'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newlyCreatedNotes, setNewlyCreatedNotes] = useState<Set<string>>(new Set());
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null);
  const { isOpen } = useSidebarContext();
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // Load notes and deleted notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedDeletedNotes = localStorage.getItem('deletedNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    if (savedDeletedNotes) {
      setDeletedNotes(JSON.parse(savedDeletedNotes));
    }
  }, []);

  // Save notes and deleted notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('deletedNotes', JSON.stringify(deletedNotes));
  }, [deletedNotes]);

  const handleButtonClick = () => {
    setIsRotated(!isRotated);
  };

  const hasEmptyNotes = notes.some(note => note.content.trim() === '');

  const createNote = (color: string) => {
    // Prevent creating new notes if there are empty notes
    if (hasEmptyNotes) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      color: color,
      content: "",
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      important: false
    };
    setNotes([...notes, newNote]);
    setIsRotated(false); // Close the color picker
    setEditingNoteId(newNote.id); // Start editing the new note
    
    // Mark as newly created for animation
    setNewlyCreatedNotes(prev => new Set([...prev, newNote.id]));
    
    // Auto-focus the new note
    setTimeout(() => {
      const textarea = textareaRefs.current[newNote.id];
      if (textarea) {
        textarea.focus();
      }
    }, 100);
    
    // Remove from newly created set after animation
    setTimeout(() => {
      setNewlyCreatedNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(newNote.id);
        return newSet;
      });
    }, 600);
  };

  const updateNoteContent = (noteId: string, content: string) => {
    // Limit to 130 characters
    if (content.length <= 130) {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, content } : note
        )
      );
    }
  };

  const startEditing = (noteId: string) => {
    setEditingNoteId(noteId);
    // Focus the textarea after setting editing state
    setTimeout(() => {
      const textarea = textareaRefs.current[noteId];
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  };

  const stopEditing = () => {
    setEditingNoteId(null);
  };

  const toggleImportant = (noteId: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId ? { ...note, important: !note.important } : note
      )
    );
  };

  const deleteNote = (noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    if (noteToDelete) {
      // Add deletion timestamp to the note
      const noteWithDeletionTime = {
        ...noteToDelete,
        deletedAt: new Date().toISOString()
      };
      // Add to deleted notes
      setDeletedNotes(prevDeleted => [...prevDeleted, noteWithDeletionTime]);
      // Remove from active notes
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    }
  };

  const restoreNote = (noteId: string) => {
    const noteToRestore = deletedNotes.find(note => note.id === noteId);
    if (noteToRestore) {
      // Remove deletion timestamp when restoring
      const { deletedAt, ...restoredNote } = noteToRestore as any;
      // Add back to active notes
      setNotes(prevNotes => [...prevNotes, restoredNote]);
      // Remove from deleted notes
      setDeletedNotes(prevDeleted => prevDeleted.filter(note => note.id !== noteId));
    }
  };

  const copyNoteContent = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId) || deletedNotes.find(n => n.id === noteId);
    if (note && note.content.trim()) {
      try {
        await navigator.clipboard.writeText(note.content);
        // You could add a toast notification here if you have toast setup
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // Calculate days remaining for deleted notes
  const getDaysRemaining = (deletedAt: string) => {
    const deletionDate = new Date(deletedAt);
    const expiryDate = new Date(deletionDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Filter notes based on current view
  const displayedNotes = currentView === 'all' 
    ? notes
    : currentView === 'important'
    ? notes.filter(note => note.important)
    : deletedNotes;

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', noteId);
    
    // Create a custom drag image with reduced opacity
    const dragElement = e.currentTarget as HTMLElement;
    const dragImage = dragElement.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.pointerEvents = 'none';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 125, 125);
    
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnter = (e: React.DragEvent, noteId: string) => {
    e.preventDefault();
    if (draggedNoteId && draggedNoteId !== noteId) {
      setDragOverNoteId(noteId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the note entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverNoteId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropTargetId: string) => {
    e.preventDefault();
    setDragOverNoteId(null);
    
    if (!draggedNoteId || draggedNoteId === dropTargetId) {
      setDraggedNoteId(null);
      return;
    }

    const draggedIndex = notes.findIndex(note => note.id === draggedNoteId);
    const dropTargetIndex = notes.findIndex(note => note.id === dropTargetId);

    if (draggedIndex === -1 || dropTargetIndex === -1) {
      setDraggedNoteId(null);
      return;
    }

    // Calculate drop position based on mouse position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    
    const newNotes = [...notes];
    const [draggedNote] = newNotes.splice(draggedIndex, 1);
    
    // Insert before or after based on mouse position
    let insertIndex = dropTargetIndex;
    if (mouseX > centerX && dropTargetIndex < newNotes.length) {
      insertIndex = dropTargetIndex + 1;
    }
    
    newNotes.splice(insertIndex, 0, draggedNote);
    setNotes(newNotes);
    setDraggedNoteId(null);
  };

  const handleDragEnd = () => {
    setDraggedNoteId(null);
    setDragOverNoteId(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#161618]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative mt-7">
            <Button
              onClick={handleButtonClick}
              disabled={hasEmptyNotes}
              className={`w-12 h-12 rounded-full transition-all duration-500 hover:scale-105 ${
                hasEmptyNotes ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: '#2e2e30' }}
              size="icon"
            >
              <Plus 
                className={`h-5 w-5 text-white transition-transform duration-500 ease-in-out ${
                  isRotated ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                }`} 
              />
            </Button>
            
            {/* Colorful dots */}
            <div className={`absolute top-14 left-1/2 transform -translate-x-1/2 flex flex-col gap-6 transition-all duration-300 ${
              isRotated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}>
              <div 
                className="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200" 
                style={{ backgroundColor: '#ffca71' }}
                onClick={() => createNote('#ffca71')}
              ></div>
              <div 
                className="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200" 
                style={{ backgroundColor: '#ff9c72' }}
                onClick={() => createNote('#ff9c72')}
              ></div>
              <div 
                className="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200" 
                style={{ backgroundColor: '#b892fc' }}
                onClick={() => createNote('#b892fc')}
              ></div>
              <div 
                className="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200" 
                style={{ backgroundColor: '#01d2fe' }}
                onClick={() => createNote('#01d2fe')}
              ></div>
              <div 
                className="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200" 
                style={{ backgroundColor: '#f1f1f1' }}
                onClick={() => createNote('#f1f1f1')}
              ></div>
            </div>
          </div>
          
          {/* Custom Notes Search Bar */}
          <div className="relative mt-7 w-[100px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="/+N"
              className="
                bg-[#1b1b1b] border border-[#414141] text-white placeholder-gray-400 pl-10 h-10
                hover:bg-[#252525] hover:border-[#555555]
                focus:border-[#666666] focus:bg-[#252525]
                rounded-full transition-all duration-300 text-sm w-full
              "
            />
          </div>
        </div>
        
        {/* Note Indicators */}
        <div className="flex items-center gap-6 mt-7">
          <div 
            onClick={() => setCurrentView('all')}
            className="flex flex-col items-center group cursor-pointer transition-all duration-300"
          >
            <span className={`font-orbitron text-2xl font-bold text-white ${
              currentView === 'all' ? 'border-b-2 border-white' : ''
            }`}>
              {notes.length}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Total Notes
            </span>
          </div>
          <div 
            onClick={() => setCurrentView('important')}
            className="flex flex-col items-center group cursor-pointer transition-all duration-300"
          >
            <span className={`font-orbitron text-2xl font-bold text-yellow-400 ${
              currentView === 'important' ? 'border-b-2 border-yellow-400' : ''
            }`}>
              {notes.filter(note => note.important).length}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Important
            </span>
          </div>
          <div 
            onClick={() => setCurrentView('deleted')}
            className="flex flex-col items-center group cursor-pointer transition-all duration-300"
          >
            <span className={`font-orbitron text-2xl font-bold text-red-400 ${
              currentView === 'deleted' ? 'border-b-2 border-red-400' : ''
            }`}>
              {deletedNotes.length}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Deleted
            </span>
          </div>
        </div>
      </div>
      
      {/* Notes Heading */}
      <div className="px-4 mt-[20px]">
        <div className="ml-20">
          <h1 className="text-white font-semibold" style={{ fontSize: '3.5rem' }}>
            {currentView === 'all' ? (
              'Notes'
            ) : (
              <span>
                <span 
                  onClick={() => setCurrentView('all')}
                  className="text-gray-400 cursor-pointer hover:text-white transition-colors duration-200 border-b-2 border-gray-400"
                >
                  Notes
                </span>
                <span> &gt; {currentView === 'important' ? 'Important' : 'Deleted'}</span>
              </span>
            )}
          </h1>
          
          {/* Information text for deleted section */}
          {currentView === 'deleted' && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
              <p className="text-red-300 text-sm leading-relaxed">
                Deleted notes will be retained for a period of 7 days. After this time, they will be permanently deleted and cannot be recovered. To extend the backup duration, please consider upgrading your plan.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Notes Grid */}
      <div className="px-4 mt-8">
        <div className={`ml-20 ${
          displayedNotes.length > 0 
            ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${
                isOpen ? 'xl:grid-cols-4' : 'xl:grid-cols-5'
              }`
            : 'flex justify-center items-center min-h-[400px]'
        }`}>
          {displayedNotes.length > 0 ? (
            displayedNotes.map((note) => (
            <div
              key={note.id}
              draggable={currentView !== 'deleted'}
              onDragStart={currentView !== 'deleted' ? (e) => handleDragStart(e, note.id) : undefined}
              onDragEnter={currentView !== 'deleted' ? (e) => handleDragEnter(e, note.id) : undefined}
              onDragLeave={currentView !== 'deleted' ? handleDragLeave : undefined}
              onDragOver={currentView !== 'deleted' ? handleDragOver : undefined}
              onDrop={currentView !== 'deleted' ? (e) => handleDrop(e, note.id) : undefined}
              onDragEnd={currentView !== 'deleted' ? handleDragEnd : undefined}
              className={`group w-[250px] h-[250px] rounded-[15px] p-4 shadow-lg flex flex-col relative transition-all duration-300 ${
                newlyCreatedNotes.has(note.id) ? 'animate-scale-in animate-fade-in' : ''
              } ${
                draggedNoteId === note.id ? 'opacity-30 scale-95 rotate-3' : ''
              } ${
                dragOverNoteId === note.id ? 'ring-2 ring-white/50 scale-105 shadow-2xl' : ''
              } hover:shadow-xl ${currentView === 'deleted' ? 'cursor-default opacity-75' : 'cursor-grab active:cursor-grabbing'}`}
              style={{ backgroundColor: note.color }}
            >
              {/* Top buttons - Different for deleted vs active notes */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {currentView === 'deleted' ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreNote(note.id);
                    }}
                    className="w-7 h-7 p-0 rounded-full hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: '#2e2e30' }}
                  >
                    <Plus className="h-4 w-4 text-green-400" />
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleImportant(note.id);
                      }}
                      className={`w-7 h-7 p-0 rounded-full hover:scale-110 transition-all duration-300 ${
                        note.important 
                          ? 'opacity-100' 
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ backgroundColor: '#2e2e30' }}
                    >
                      <Star 
                        className={`h-4 w-4 transition-all duration-300 ${
                          note.important 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-yellow-400'
                        }`}
                      />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="w-7 h-7 p-0 rounded-full hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: '#2e2e30' }}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyNoteContent(note.id);
                      }}
                      className="w-7 h-7 p-0 rounded-full hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: '#2e2e30' }}
                    >
                      <Copy className="h-4 w-4 text-blue-400" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        // AI functionality placeholder
                      }}
                      className="w-7 h-7 p-0 rounded-full hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: '#2e2e30' }}
                    >
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </Button>
                  </>
                )}
              </div>
              
              <textarea
                ref={(el) => {
                  textareaRefs.current[note.id] = el;
                }}
                value={note.content}
                onChange={currentView !== 'deleted' ? (e) => updateNoteContent(note.id, e.target.value) : undefined}
                onBlur={currentView !== 'deleted' ? stopEditing : undefined}
                onMouseDown={(e) => {
                  if (editingNoteId !== note.id || currentView === 'deleted') {
                    e.preventDefault();
                  }
                }}
                placeholder="What are you writing today?"
                maxLength={130}
                readOnly={editingNoteId !== note.id || currentView === 'deleted'}
                className={`flex-1 bg-transparent border-none resize-none outline-none text-black placeholder-black/60 leading-relaxed mb-2 ${
                  currentView === 'deleted' ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                }`}
                style={{ fontFamily: 'inherit', fontSize: '1.1rem' }}
              />
              <div className="flex items-center justify-between text-xs mt-auto">
                {note.content && (
                  <span className="text-black">
                    {currentView === 'deleted' && (note as any).deletedAt ? (
                      (() => {
                        const daysLeft = getDaysRemaining((note as any).deletedAt);
                        return daysLeft > 0 
                          ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
                          : 'Expires today';
                      })()
                    ) : (
                      note.createdAt
                    )}
                  </span>
                )}
                {currentView !== 'deleted' && (note.content || note.content.trim() === '') && (
                  <Button
                    onClick={() => startEditing(note.id)}
                    className="h-8 w-8 p-0 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-black/30"
                    style={{ backgroundColor: '#2e2e30' }}
                  >
                    <Pencil className="h-4 w-4 text-white hover:rotate-12 transition-transform duration-300" />
                  </Button>
                )}
              </div>
            </div>
          ))
          ) : (
            currentView !== 'deleted' && (
              <div className="text-center max-w-md mx-auto">
                <p className="text-gray-300 text-lg leading-relaxed">
                  Hey there! Your space is looking a bit empty—kinda like a fridge with nothing but a lone ketchup bottle! 
                  Start jotting down your daily ideas, tasks, or even that random grocery list to bring it to life. 
                  Let's fill it up with your brilliance!
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
