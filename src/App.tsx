import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, useSidebarContext } from "./contexts/SidebarContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import DarkSidebar from "./components/DarkSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ChatMode from "./pages/ChatMode";
import Chat from "./pages/Chat";
import Waitlist from "./pages/Waitlist";
import NotFound from "./pages/NotFound";
import Files from "./pages/Files";
import Testings1 from "./pages/Testings1";
import Notes from "./pages/Notes";
import Todos from "./pages/Todos";
import Tasks from "./pages/tasks-file";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOpen } = useSidebarContext();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex min-h-screen w-full bg-[#161618]">
      {/* Custom styles for notification animations */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-out-right {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
      
      {isAuthenticated && <DarkSidebar />}
      <div className={`flex-1 transition-all duration-300 ${isAuthenticated && isOpen ? 'ml-[260px]' : isAuthenticated ? 'ml-[70px]' : ''}`}>
        <Routes>
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/" element={<Navigate to="/waitlist" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/chatmode" element={
            <ProtectedRoute>
              <ChatMode />
            </ProtectedRoute>
          } />
          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/files" element={
            <ProtectedRoute>
              <Files />
            </ProtectedRoute>
          } />
          <Route path="/testings1" element={
            <ProtectedRoute>
              <Testings1 />
            </ProtectedRoute>
          } />
          <Route path="/notes" element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          } />
          <Route path="/todos" element={
            <ProtectedRoute>
              <Todos />
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            <SidebarProvider>
              <AppContent />
            </SidebarProvider>
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
