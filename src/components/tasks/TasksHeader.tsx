import React, { useState } from 'react';
import { Plus, Search, LayoutGrid, Filter, List, Calendar, Grid3x3, ChevronDown, Clock, Flag, CheckCircle, Tag, AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { IconToggle } from '@/components/ui/icon-toggle';

interface TasksHeaderProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  currentView: string;
  setCurrentView: (view: string) => void;
  onCreateTask: () => void;
  isRotated: boolean;
}

const TasksHeader = ({ 
  totalTasks, 
  completedTasks, 
  pendingTasks, 
  currentView, 
  setCurrentView, 
  onCreateTask, 
  isRotated 
}: TasksHeaderProps) => {
  const [displayPopoverOpen, setDisplayPopoverOpen] = useState(false);
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

  return (
    <>
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
                        Sort Tasks by due date, priority, completion status, or creation date.
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
                        Find Tasks by keyword, date, priority, or label.
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

          {/* Tasks Creating Button */}
          <div className="relative mt-7">
            <Button
              onClick={onCreateTask}
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
        
        {/* Task Indicators */}
        <div className="flex items-center gap-6 mt-7">
          <div className="flex flex-col items-center group cursor-pointer transition-all duration-300">
            <span className="font-orbitron text-2xl font-bold text-white border-b-2 border-white">
              {totalTasks}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Total Tasks
            </span>
          </div>
          <div className="flex flex-col items-center group cursor-pointer transition-all duration-300">
            <span className="font-orbitron text-2xl font-bold text-green-400">
              {completedTasks}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Completed
            </span>
          </div>
          <div className="flex flex-col items-center group cursor-pointer transition-all duration-300">
            <span className="font-orbitron text-2xl font-bold text-red-400">
              {pendingTasks}
            </span>
            <span className="text-xs text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Pending
            </span>
          </div>
        </div>
      </div>
      
      {/* Tasks Heading */}
      <div className="px-4 mt-[20px]">
        <div className="ml-20">
          <h1 className="text-white font-semibold" style={{ fontSize: '3.5rem' }}>
            Tasks
          </h1>
        </div>
      </div>
    </>
  );
};

export default TasksHeader;