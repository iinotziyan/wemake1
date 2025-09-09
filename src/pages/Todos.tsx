import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, X, LayoutGrid, Filter, List, Calendar, Grid3x3, ChevronDown, Clock, Flag, CheckCircle, Tag, AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { IconToggle } from '@/components/ui/icon-toggle';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isEditing?: boolean;
  selected?: boolean;
}

interface Section {
  id: string;
  name: string;
  todos: Todo[];
  isEditing?: boolean;
}

const Todos = () => {
  const [isRotated, setIsRotated] = useState(false);
  const [freeTodos, setFreeTodos] = useState<Todo[]>([]); // Todos not in any section
  const [sections, setSections] = useState<Section[]>([]);
  const [displayPopoverOpen, setDisplayPopoverOpen] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortCollapsed, setSortCollapsed] = useState(true);
  const [sortToggles, setSortToggles] = useState({
    dueDate: false,
    priority: false,
    completionStatus: false,
    creationDate: true,
    pages: false,
    chats: false
  });
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [filterToggles, setFilterToggles] = useState({
    keyword: false,
    date: false,
    priority: false,
    label: false,
    pages: false,
    chats: false
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleTodoClick = (id: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Check both free todos and section todos
      setFreeTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, selected: !todo.selected } : todo
      ));
      setSections(prev => prev.map(section => ({
        ...section,
        todos: section.todos.map(todo => 
          todo.id === id ? { ...todo, selected: !todo.selected } : todo
        )
      })));
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;
    
    setSections(prev => {
      let draggedTodo: Todo | null = null;
      let sourceSectionId = '';
      let draggedIndex = -1;
      let targetIndex = -1;
      let targetSectionId = '';

      // Find dragged item and its section
      for (const section of prev) {
        const index = section.todos.findIndex(todo => todo.id === draggedItem);
        if (index !== -1) {
          draggedTodo = section.todos[index];
          sourceSectionId = section.id;
          draggedIndex = index;
          break;
        }
      }

      // Find target item and its section
      for (const section of prev) {
        const index = section.todos.findIndex(todo => todo.id === targetId);
        if (index !== -1) {
          targetIndex = index;
          targetSectionId = section.id;
          break;
        }
      }

      if (!draggedTodo || draggedIndex === -1 || targetIndex === -1) return prev;

      return prev.map(section => {
        if (section.id === sourceSectionId && section.id === targetSectionId) {
          // Same section reorder
          const newTodos = [...section.todos];
          const [removed] = newTodos.splice(draggedIndex, 1);
          newTodos.splice(targetIndex, 0, removed);
          return { ...section, todos: newTodos };
        } else if (section.id === sourceSectionId) {
          // Remove from source
          return { ...section, todos: section.todos.filter(todo => todo.id !== draggedItem) };
        } else if (section.id === targetSectionId) {
          // Add to target
          const newTodos = [...section.todos];
          newTodos.splice(targetIndex, 0, draggedTodo);
          return { ...section, todos: newTodos };
        }
        return section;
      });
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const createNewSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      name: '',
      todos: [],
      isEditing: true
    };
    
    setSections(prev => [...prev, newSection]);
    
    // Focus the section name input after the component updates
    setTimeout(() => {
      const input = inputRefs.current[newSection.id];
      if (input) {
        input.focus();
      }
    }, 50);
  };

  const handleButtonClick = (sectionId?: string) => {
    setIsRotated(!isRotated);
    
    // If sectionId is provided, create todo in that section
    if (sectionId) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: '',
        completed: false,
        isEditing: true
      };
      
      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { ...section, todos: [...section.todos, newTodo] }
          : section
      ));
      
      // Focus the input after the component updates
      setTimeout(() => {
        const input = inputRefs.current[newTodo.id];
        if (input) {
          input.focus();
        }
      }, 50);
    } else {
      // Create a free todo (not in any section)
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: '',
        completed: false,
        isEditing: true
      };
      
      setFreeTodos(prev => [...prev, newTodo]);
      
      // Focus the input after the component updates
      setTimeout(() => {
        const input = inputRefs.current[newTodo.id];
        if (input) {
          input.focus();
        }
      }, 50);
    }
  };

  const startEditingTodo = (id: string) => {
    // Check both free todos and section todos
    setFreeTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, isEditing: true } : todo
    ));
    setSections(prev => prev.map(section => ({
      ...section,
      todos: section.todos.map(todo => 
        todo.id === id ? { ...todo, isEditing: true } : todo
      )
    })));
    
    setTimeout(() => {
      const input = inputRefs.current[id];
      if (input) {
        input.focus();
      }
    }, 50);
  };

  const startEditingSection = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, isEditing: true } : section
    ));
    
    setTimeout(() => {
      const input = inputRefs.current[id];
      if (input) {
        input.focus();
      }
    }, 50);
  };

  const saveTodoEdit = (id: string, newText: string) => {
    if (newText.trim() === '') {
      deleteTodo(id);
      return;
    }
    
    // Update both free todos and section todos
    setFreeTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, text: newText, isEditing: false } : todo
    ));
    setSections(prev => prev.map(section => ({
      ...section,
      todos: section.todos.map(todo => 
        todo.id === id ? { ...todo, text: newText, isEditing: false } : todo
      )
    })));
  };

  const saveSectionEdit = (id: string, newName: string) => {
    if (newName.trim() === '') {
      deleteSection(id);
      return;
    }
    
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, name: newName, isEditing: false } : section
    ));
  };

  const handleTodoKeyPress = (e: React.KeyboardEvent, id: string, text: string) => {
    if (e.key === 'Enter') {
      saveTodoEdit(id, text);
    } else if (e.key === 'Escape') {
      if (text === '') {
        deleteTodo(id);
      } else {
        // Update both free todos and section todos
        setFreeTodos(prev => prev.map(todo => 
          todo.id === id ? { ...todo, isEditing: false } : todo
        ));
        setSections(prev => prev.map(section => ({
          ...section,
          todos: section.todos.map(todo => 
            todo.id === id ? { ...todo, isEditing: false } : todo
          )
        })));
      }
    }
  };

  const handleSectionKeyPress = (e: React.KeyboardEvent, id: string, name: string) => {
    if (e.key === 'Enter') {
      saveSectionEdit(id, name);
    } else if (e.key === 'Escape') {
      if (name === '') {
        deleteSection(id);
      } else {
        setSections(prev => prev.map(section => 
          section.id === id ? { ...section, isEditing: false } : section
        ));
      }
    }
  };

  const toggleTodo = (id: string) => {
    // Update both free todos and section todos
    setFreeTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    setSections(prev => prev.map(section => ({
      ...section,
      todos: section.todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    })));
  };

  const deleteTodo = (id: string) => {
    // Delete from both free todos and section todos
    setFreeTodos(prev => prev.filter(todo => todo.id !== id));
    setSections(prev => prev.map(section => ({
      ...section,
      todos: section.todos.filter(todo => todo.id !== id)
    })));
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
  };

  // Calculate totals across all free todos and sections
  const totalTodos = freeTodos.length + sections.reduce((acc, section) => acc + section.todos.length, 0);
  const completedTodos = freeTodos.filter(todo => todo.completed).length + 
    sections.reduce((acc, section) => acc + section.todos.filter(todo => todo.completed).length, 0);
  const pendingTodos = totalTodos - completedTodos;

  return (
    <div className="min-h-screen w-full bg-[#161618]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-4">
          {/* Display Selector Button */}
          <div className="relative mt-7">
            <Popover open={displayPopoverOpen} onOpenChange={setDisplayPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  className="w-12 h-12 rounded-full transition-all duration-500 hover:scale-105"
                  style={{ backgroundColor: '#2e2e30' }}
                  size="icon"
                >
                  <LayoutGrid className="h-5 w-5 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[300px] h-[300px] p-4 border border-[#414141] shadow-xl z-50 overflow-y-auto rounded-[20px]"
                style={{ background: '#1F1F1F' }}
                align="start"
              >
                <div className="space-y-4">
                  {/* Layout Section */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Layout</h3>
                    <div className="flex gap-2" style={{ background: '#2E2E30', borderRadius: '1.5rem', padding: '0px' }}>
                      {[
                        { value: 'list', label: 'List', icon: List },
                        { value: 'board', label: 'Board', icon: Grid3x3 },
                        { value: 'calendar', label: 'Calendar', icon: Calendar }
                      ].map((view, index) => {
                        const IconComponent = view.icon;
                        const isFirst = index === 0;
                        const isLast = index === 2;
                        const borderRadius = isFirst ? 'rounded-l-3xl' : isLast ? 'rounded-r-3xl' : '';
                        
                        return (
                          <button
                            key={view.value}
                            onClick={() => {
                              setCurrentView(view.value);
                            }}
                            className={`flex-1 flex flex-col items-center px-3 py-3 ${borderRadius} transition-colors duration-200 ${
                              currentView === view.value 
                                ? 'bg-[#414141] text-white' 
                                : 'text-gray-300 hover:bg-[#353537] hover:text-white'
                            }`}
                          >
                            <IconComponent className="h-5 w-5 mb-1" />
                            <span className="text-xs">{view.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-[#414141]"></div>

                  {/* Sort Section */}
                  <div>
                    <Collapsible open={!sortCollapsed} onOpenChange={(open) => setSortCollapsed(!open)}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
                        <h3 className="text-white font-medium">Sort</h3>
                        <ChevronDown 
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            !sortCollapsed ? 'rotate-180' : ''
                          }`} 
                        />
                      </CollapsibleTrigger>
                      <p className="text-xs text-gray-400 mb-3">
                        Sort To-Dos by due date, priority, completion status, or creation date.
                      </p>
                      <CollapsibleContent className="space-y-3">
                        {[
                          { key: 'dueDate', label: 'Due Date', icon: Calendar },
                          { key: 'priority', label: 'Priority', icon: Flag },
                          { key: 'completionStatus', label: 'Completion Status', icon: CheckCircle },
                          { key: 'creationDate', label: 'Creation Date', icon: Clock },
                          { key: 'pages', label: 'Pages', icon: FileText },
                          { key: 'chats', label: 'Chats', icon: MessageSquare }
                        ].map((sortOption) => (
                          <div key={sortOption.key} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">{sortOption.label}</span>
                            <IconToggle
                              icon={sortOption.icon}
                              checked={sortToggles[sortOption.key as keyof typeof sortToggles]}
                              onCheckedChange={(checked) => 
                                setSortToggles(prev => ({ ...prev, [sortOption.key]: checked }))
                              }
                            />
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-[#414141]"></div>

                  {/* Filter Section */}
                  <div>
                    <Collapsible open={!filterCollapsed} onOpenChange={(open) => setFilterCollapsed(!open)}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
                        <h3 className="text-white font-medium">Filter</h3>
                        <ChevronDown 
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            !filterCollapsed ? 'rotate-180' : ''
                          }`} 
                        />
                      </CollapsibleTrigger>
                      <p className="text-xs text-gray-400 mb-3">
                        Find To-Dos by keyword, date, priority, or label.
                      </p>
                      <CollapsibleContent className="space-y-3">
                        {[
                          { key: 'keyword', label: 'Keyword', icon: Search },
                          { key: 'date', label: 'Date', icon: Calendar },
                          { key: 'priority', label: 'Priority', icon: AlertCircle },
                          { key: 'label', label: 'Label', icon: Tag },
                          { key: 'pages', label: 'Pages', icon: FileText },
                          { key: 'chats', label: 'Chats', icon: MessageSquare }
                        ].map((filterOption) => (
                          <div key={filterOption.key} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">{filterOption.label}</span>
                            <IconToggle
                              icon={filterOption.icon}
                              checked={filterToggles[filterOption.key as keyof typeof filterToggles]}
                              onCheckedChange={(checked) => 
                                setFilterToggles(prev => ({ ...prev, [filterOption.key]: checked }))
                              }
                            />
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Todos Creating Button */}
          <div className="relative mt-7">
            <Button
              onClick={() => handleButtonClick()}
              className="w-12 h-12 rounded-full transition-all duration-500 hover:scale-105"
              style={{ backgroundColor: '#2e2e30' }}
              size="icon"
            >
              <Plus 
                className={`h-5 w-5 text-white transition-transform duration-500 ease-in-out ${
                  isRotated ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                }`} 
              />
            </Button>
          </div>
          
          {/* Custom Search Bar */}
          <div className="relative mt-7 w-[100px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="/+T"
              className="
                bg-[#1b1b1b] border border-[#414141] text-white placeholder-gray-400 pl-10 h-10
                hover:bg-[#252525] hover:border-[#555555]
                focus:border-[#666666] focus:bg-[#252525]
                rounded-full transition-all duration-300 text-sm w-full
              "
            />
          </div>
        </div>
        
        {/* Todo Indicators */}
        <div className="flex items-center gap-6 mt-7">
          <div className="flex flex-col items-center group cursor-pointer transition-all duration-300">
            <span className="font-orbitron text-2xl font-bold text-white border-b-2 border-white">
              {totalTodos}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Total Todos
            </span>
          </div>
          <div className="flex flex-col items-center group cursor-pointer transition-all duration-300">
            <span className="font-orbitron text-2xl font-bold text-green-400">
              {completedTodos}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Completed
            </span>
          </div>
          <div className="flex flex-col items-center group cursor-pointer transition-all duration-300">
            <span className="font-orbitron text-2xl font-bold text-red-400">
              {pendingTodos}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Pending
            </span>
          </div>
        </div>
      </div>
      
      {/* Todos Heading */}
      <div className="px-4 mt-[20px]">
        <div className="ml-20">
          <h1 className="text-white font-semibold" style={{ fontSize: '3.5rem' }}>
            Todos
          </h1>
          {/* Create a new Section text - only show if no free todos and no sections exist and in list view */}
          {freeTodos.length === 0 && sections.length === 0 && currentView === 'list' && (
            <button
              onClick={createNewSection}
              className="text-gray-400 hover:text-white transition-colors duration-200 mt-4 text-lg"
            >
              Create a new Section
            </button>
          )}
        </div>
      </div>

      {/* Free Todos (not in any section) */}
      {freeTodos.length > 0 && (
        <div className="px-4 mt-8">
          <div className="ml-20 space-y-3">
            {freeTodos
              .filter((todo) => {
                if (filter === 'completed') return todo.completed;
                if (filter === 'pending') return !todo.completed;
                return true; // 'all'
              })
              .map((todo) => (
                <div 
                  key={todo.id} 
                  onClick={(e) => handleTodoClick(todo.id, e)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-[650px] cursor-pointer ${
                    todo.selected ? 'ring-2 ring-blue-500 bg-blue-500/10' : 'bg-transparent hover:bg-white/5'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!todo.isEditing) toggleTodo(todo.id);
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                      todo.completed 
                        ? 'bg-white border-white' 
                        : 'border-gray-400 hover:border-gray-300'
                    } ${todo.isEditing ? 'opacity-50' : ''}`}
                    disabled={todo.isEditing}
                  >
                    {todo.completed && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                    )}
                  </button>
                  
                  {todo.isEditing ? (
                    <Input
                      ref={(el) => (inputRefs.current[todo.id] = el)}
                      value={todo.text}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setFreeTodos(prev => prev.map(t => 
                          t.id === todo.id ? { ...t, text: newText } : t
                        ));
                      }}
                      onBlur={() => saveTodoEdit(todo.id, todo.text)}
                      onKeyDown={(e) => handleTodoKeyPress(e, todo.id, todo.text)}
                      className="flex-1 bg-[#1b1b1b] border border-[#414141] text-white text-sm"
                      placeholder="Enter todo..."
                    />
                  ) : (
                    <span 
                      className={`flex-1 text-white transition-all duration-200 cursor-pointer ${
                        todo.completed ? 'line-through opacity-60' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingTodo(todo.id);
                      }}
                    >
                      {todo.text}
                    </span>
                  )}
                </div>
              ))}
            
            {/* Create new section button below free todos */}
            <div className="flex justify-center mt-6">
              <button
                onClick={createNewSection}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Create a new Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="px-4 mt-8">
        <div className="ml-20 space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                {section.isEditing ? (
                  <Input
                    ref={(el) => (inputRefs.current[section.id] = el)}
                    value={section.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setSections(prev => prev.map(s => 
                        s.id === section.id ? { ...s, name: newName } : s
                      ));
                    }}
                    onBlur={() => saveSectionEdit(section.id, section.name)}
                    onKeyDown={(e) => handleSectionKeyPress(e, section.id, section.name)}
                    className="text-xl font-semibold bg-[#1b1b1b] border border-[#414141] text-white w-[300px]"
                    placeholder="Enter section name..."
                  />
                ) : (
                  <h2 
                    className="text-xl font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors duration-200"
                    onClick={() => startEditingSection(section.id)}
                  >
                    {section.name || 'Untitled Section'}
                  </h2>
                )}
                
                {/* Add Todo Button for this section */}
                <Button
                  onClick={() => handleButtonClick(section.id)}
                  className="w-8 h-8 rounded-full bg-[#2e2e30] hover:bg-[#353537] transition-all duration-200"
                  size="icon"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              </div>
              
              {/* Section Todos */}
              <div className="space-y-3">
                {section.todos
                  .filter((todo) => {
                    if (filter === 'completed') return todo.completed;
                    if (filter === 'pending') return !todo.completed;
                    return true; // 'all'
                  })
                  .map((todo) => (
                  <div 
                    key={todo.id} 
                    draggable={!todo.isEditing}
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, todo.id)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => handleTodoClick(todo.id, e)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-[650px] cursor-pointer ${
                      todo.selected ? 'ring-2 ring-blue-500 bg-blue-500/10' : 'bg-transparent hover:bg-white/5'
                    } ${draggedItem === todo.id ? 'opacity-50 scale-95' : ''}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!todo.isEditing) toggleTodo(todo.id);
                      }}
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                        todo.completed 
                          ? 'bg-white border-white' 
                          : 'border-gray-400 hover:border-gray-300'
                      } ${todo.isEditing ? 'opacity-50' : ''}`}
                      disabled={todo.isEditing}
                    >
                      {todo.completed && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                      )}
                    </button>
                    
                    {todo.isEditing ? (
                      <Input
                        ref={(el) => (inputRefs.current[todo.id] = el)}
                        value={todo.text}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setSections(prev => prev.map(s => ({
                            ...s,
                            todos: s.todos.map(t => 
                              t.id === todo.id ? { ...t, text: newText } : t
                            )
                          })));
                        }}
                        onBlur={() => saveTodoEdit(todo.id, todo.text)}
                        onKeyDown={(e) => handleTodoKeyPress(e, todo.id, todo.text)}
                        className="flex-1 bg-[#1b1b1b] border border-[#414141] text-white text-sm"
                        placeholder="Enter todo..."
                      />
                    ) : (
                      <span 
                        className={`flex-1 text-white transition-all duration-200 cursor-pointer ${
                          todo.completed ? 'line-through opacity-60' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTodo(todo.id);
                        }}
                      >
                        {todo.text}
                      </span>
                    )}
                  </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Todos;