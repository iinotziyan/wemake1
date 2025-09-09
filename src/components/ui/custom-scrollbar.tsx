
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
}

const CustomScrollbar = ({ children, className, height = "100%" }: CustomScrollbarProps) => {
  return (
    <div 
      className={cn("custom-scrollbar overflow-y-auto", className)}
      style={{ height }}
    >
      {children}
    </div>
  );
};

export default CustomScrollbar;
