import React, { useState } from 'react';
import TasksHeader from '@/components/tasks/TasksHeader';
import { Plus, CheckCircle, ChevronRight, MoreVertical, FileText, AlignLeft, Calendar, Flag, Bell, Tag, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  creationDate: string;
  dueDate: string;
  time: string;
  priority: 'Low' | 'Medium' | 'High';
  description: string;
}

const Tasks = () => {
  const [currentView, setCurrentView] = useState('list');
  const [isRotated, setIsRotated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSectionExpanded, setIsSectionExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;

  const handleCreateTask = () => {
    setIsRotated(!isRotated);
    setIsAddingTask(true);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const currentDate = new Date();
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        creationDate: currentDate.toLocaleDateString(),
        dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
        time: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: 'Medium',
        description: ''
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#161618]">
      <TasksHeader
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onCreateTask={handleCreateTask}
        isRotated={isRotated}
      />
      
      {/* LIST View Content */}
      {currentView === 'list' && (
        <div className="px-4 mt-4">
          <div className="ml-20">
            
            {/* Case b & e: Tasks-By-Kairo Section */}
            <div className="max-w-[980px]">
              {/* Case f: Section heading with K icon that transforms to chevron on hover */}
              <div 
                className="flex items-center gap-2 mb-4 cursor-pointer group relative bg-[#1b1b1b] border border-[#525252] rounded-[20px]"
                style={{ padding: '0.80rem' }}
                onClick={() => setIsSectionExpanded(!isSectionExpanded)}
              >
                {/* K icon (visible by default) */}
                <span className={`h-5 w-5 flex items-center justify-center text-gray-400 font-orbitron font-bold text-xl group-hover:opacity-0 transition-all duration-200`}>
                  K
                </span>
                {/* Chevron icon (visible on hover) */}
                <ChevronRight 
                  className={`h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute ${
                    isSectionExpanded ? 'rotate-90' : 'rotate-0'
                  }`}
                />
                <h2 className="text-white text-xl font-semibold">Tasks Made By Kairo</h2>
                
                {/* Task count indicator - positioned right next to heading */}
                <div className="bg-[#242628] border border-[#414141] text-white font-orbitron font-bold px-3 py-1 rounded-[5px]">
                  {tasks.length}
                </div>

                {/* Three-dot menu icon (visible on hover) */}
                <MoreVertical 
                  className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-auto"
                />
              </div>
            </div>
            
            {/* Expandable content - positioned below the main section */}
            {isSectionExpanded && (
              <div className="bg-transparent max-w-[980px]">
                {/* Table for tasks */}
                <div className="bg-transparent rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#414141] hover:bg-transparent bg-transparent">
                        <TableHead className="text-gray-400 font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Task Name
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-medium">
                          <div className="flex items-center gap-2">
                            <AlignLeft className="h-4 w-4" />
                            Description
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Creation Date
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-medium">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Priority
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-400 font-medium w-24">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Progress
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow 
                          key={task.id} 
                          className="border-b border-[#414141] hover:bg-[#313133] cursor-pointer bg-transparent"
                          onClick={() => handleToggleTask(task.id)}
                        >
                          <TableCell className={`${
                            task.completed ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div 
                                className={`w-4 h-4 border-2 rounded-full cursor-pointer transition-colors ${
                                  task.completed 
                                    ? 'bg-white border-white' 
                                    : 'border-gray-400 hover:border-gray-300'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTask(task.id);
                                }}
                              >
                              </div>
                              {task.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{task.description || 'No description'}</TableCell>
                          <TableCell className="text-white">{task.creationDate}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                              task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {task.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full border-2 border-gray-600 flex items-center justify-center">
                                <CheckCircle 
                                  className={`h-4 w-4 transition-colors ${
                                    task.completed ? 'text-green-400' : 'text-gray-500'
                                  }`}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              
                {/* Add New Task Input */}
                {isAddingTask && (
                  <div className="p-4 bg-transparent border border-[#525252] rounded-[20px] min-h-[160px] relative z-10 overflow-visible">
                    {/* Section 1: Title */}
                    <div className="mb-2">
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Task title"
                        className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base font-semibold"
                        autoFocus
                      />
                    </div>

                    {/* Section 2: Description */}
                    <div className="mb-2">
                      <textarea
                        placeholder="Description"
                        className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 p-0 resize-none min-h-[40px] outline-none text-sm"
                      />
                    </div>

                    {/* Separator Line */}
                    <div className="border-t border-[#414141] mb-4"></div>

                    {/* Section 3: Bottom Section with Action Buttons and Main Buttons */}
                    <div className="flex flex-wrap justify-between items-center gap-2 relative z-20">
                      {/* Action Buttons in Middle (with border) */}
                      <div className="border border-[#414141] rounded-[20px] p-2 flex flex-wrap gap-2 relative z-30 bg-[#1b1b1b]">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent",
                                !selectedDate && "text-gray-400"
                              )}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              {selectedDate ? format(selectedDate, "MMM dd") : "Date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                          <Flag className="h-4 w-4 mr-2" />
                          Priority
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                          <Bell className="h-4 w-4 mr-2" />
                          Reminder
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                          <Tag className="h-4 w-4 mr-2" />
                          Label
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                          <MapPin className="h-4 w-4 mr-2" />
                          Location
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                          <Clock className="h-4 w-4 mr-2" />
                          Deadline
                        </Button>
                      </div>

                      {/* Main Action Buttons on Right */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => {
                            setIsAddingTask(false);
                            setNewTaskTitle('');
                          }}
                          variant="ghost"
                          size="sm"
                          className="border border-[#690707] rounded-[10px] bg-[#391e1e] text-[crimson] hover:bg-[#391e1e] hover:text-[crimson]"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="border border-[#5f5c74] bg-[#13132f] rounded-[10px] text-[#dedede] hover:bg-[#13132f] hover:text-[#dedede]"
                        >
                          Draft
                        </Button>
                        <Button
                          onClick={handleAddTask}
                          size="sm"
                          className="border border-[#252232] bg-white text-[#252232] rounded-[14px] hover:bg-white hover:text-[#252232]"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Add Task Button */}
                {!isAddingTask && (
                  <Button
                    onClick={() => setIsAddingTask(true)}
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2A2A2C] p-3 rounded-lg"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Add a task
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;