
import { useState, useEffect, useRef } from 'react';
import { updateRecentFile } from '../../../../services/fileService';

export const useFileRenderer = (file: any, isEditing: boolean, onEditEnd?: () => void) => {
  const [editContent, setEditContent] = useState('');
  const [currentFileContent, setCurrentFileContent] = useState('');
  const [isAnimatingContent, setIsAnimatingContent] = useState(false);
  const [animatedContent, setAnimatedContent] = useState('');
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [animationCancelled, setAnimationCancelled] = useState(false);
  const [originalContentBeforeAnimation, setOriginalContentBeforeAnimation] = useState('');
  
  // Add refs to maintain state across re-renders
  const animationStateRef = useRef({
    isAnimating: false,
    content: '',
    cancelled: false,
    originalContent: ''
  });

  useEffect(() => {
    if (isEditing && file) {
      setEditContent(file.content || '');
    }
  }, [isEditing, file]);

  useEffect(() => {
    if (file) {
      // Only reset if we're not in the middle of an animation
      if (!animationStateRef.current.isAnimating) {
        setCurrentFileContent(file.content || '');
        setHasAutoSaved(false);
        setIsAnimatingContent(false);
        setAnimatedContent('');
        setAnimationCancelled(false);
        setOriginalContentBeforeAnimation('');
      }
    }
  }, [file]);

  // Auto-save and rename based on first word for untitled markdown files
  useEffect(() => {
    if (isEditing && editContent && !hasAutoSaved && file && file.name === 'untitled.md') {
      const firstWord = editContent.trim().split(/\s+/)[0];
      if (firstWord && firstWord.length > 0) {
        const newFileName = `${firstWord}.md`;
        
        const success = updateRecentFile(file.id, { 
          name: newFileName,
          content: editContent,
          lastModified: Date.now(),
          size: new Blob([editContent]).size
        });
        
        if (success) {
          file.name = newFileName;
          file.content = editContent;
          file.lastModified = Date.now();
          file.size = new Blob([editContent]).size;
          setCurrentFileContent(editContent);
          setHasAutoSaved(true);
          
          window.dispatchEvent(new CustomEvent('recentFilesUpdated'));
        }
      }
    }
  }, [editContent, isEditing, hasAutoSaved, file]);

  // Listen for file content updates from chat
  useEffect(() => {
    const handleFileContentUpdate = (event: CustomEvent) => {
      const { fileId, content, animated } = event.detail;
      
      if (file && file.id === fileId) {
        console.log('File content update received:', { animated, contentLength: content.length });
        
        if (animated) {
          // Store original content before animation starts
          const originalContent = file.content || '';
          setOriginalContentBeforeAnimation(originalContent);
          setIsAnimatingContent(true);
          setAnimatedContent(content);
          setCurrentFileContent('');
          setAnimationCancelled(false);
          
          // Update ref to maintain state across re-renders
          animationStateRef.current = {
            isAnimating: true,
            content: content,
            cancelled: false,
            originalContent: originalContent
          };
          
          console.log('Animation started for file:', fileId);
        } else {
          const success = updateRecentFile(fileId, { 
            content: content,
            lastModified: Date.now(),
            size: new Blob([content]).size
          });
          
          if (success) {
            file.content = content;
            file.lastModified = Date.now();
            file.size = new Blob([content]).size;
            setCurrentFileContent(content);
          }
        }
      }
    };

    // Listen for cancellation events to reset animation state
    const handleCancelTyping = () => {
      console.log('File animation cancellation received');
      if (animationStateRef.current.isAnimating) {
        console.log('Cancelling animation and restoring original content');
        setAnimationCancelled(true);
        setIsAnimatingContent(false);
        setAnimatedContent('');
        // Restore the original content from before animation started
        setCurrentFileContent(animationStateRef.current.originalContent);
        
        // Update ref
        animationStateRef.current = {
          ...animationStateRef.current,
          isAnimating: false,
          cancelled: true
        };
      }
    };

    window.addEventListener('updateFileContent', handleFileContentUpdate as EventListener);
    window.addEventListener('cancelTypingAnimation', handleCancelTyping);
    
    return () => {
      window.removeEventListener('updateFileContent', handleFileContentUpdate as EventListener);
      window.removeEventListener('cancelTypingAnimation', handleCancelTyping);
    };
  }, [file]);

  // Sync state with ref on component mount/update
  useEffect(() => {
    if (animationStateRef.current.isAnimating && !isAnimatingContent) {
      console.log('Restoring animation state from ref');
      setIsAnimatingContent(true);
      setAnimatedContent(animationStateRef.current.content);
      setOriginalContentBeforeAnimation(animationStateRef.current.originalContent);
      setAnimationCancelled(animationStateRef.current.cancelled);
    }
  }, [isAnimatingContent]);

  useEffect(() => {
    const handleSaveEdit = async () => {
      if (isEditing) {
        await handleEditSave();
      }
    };

    const handleCancelEdit = () => {
      if (isEditing) {
        handleEditCancel();
      }
    };

    window.addEventListener('saveFileEdit', handleSaveEdit);
    window.addEventListener('cancelFileEdit', handleCancelEdit);

    return () => {
      window.removeEventListener('saveFileEdit', handleSaveEdit);
      window.removeEventListener('cancelFileEdit', handleCancelEdit);
    };
  }, [isEditing, editContent, file, onEditEnd]);

  const handleAnimationComplete = () => {
    console.log('File typing animation completed, cancelled:', animationCancelled);
    
    // Only update content if animation wasn't cancelled
    if (!animationCancelled && !animationStateRef.current.cancelled) {
      setIsAnimatingContent(false);
      
      // Update the file content in the file service
      const success = updateRecentFile(file.id, { 
        content: animatedContent,
        lastModified: Date.now(),
        size: new Blob([animatedContent]).size
      });
      
      if (success) {
        file.content = animatedContent;
        file.lastModified = Date.now();
        file.size = new Blob([animatedContent]).size;
        setCurrentFileContent(animatedContent);
      }
      
      setAnimatedContent('');
      
      // Clear animation state from ref
      animationStateRef.current = {
        isAnimating: false,
        content: '',
        cancelled: false,
        originalContent: ''
      };
      
      const event = new CustomEvent('fileTypingAnimationComplete');
      window.dispatchEvent(event);
    } else {
      // If cancelled, just reset the animation state without updating content
      setIsAnimatingContent(false);
      setAnimatedContent('');
      setAnimationCancelled(false);
      
      // Clear animation state from ref
      animationStateRef.current = {
        isAnimating: false,
        content: '',
        cancelled: false,
        originalContent: ''
      };
    }
  };

  const handleEditSave = async () => {
    try {
      const success = updateRecentFile(file.id, { 
        content: editContent,
        lastModified: Date.now(),
        size: new Blob([editContent]).size
      });
      
      if (success) {
        file.content = editContent;
        file.lastModified = Date.now();
        file.size = new Blob([editContent]).size;
        setCurrentFileContent(editContent);
        
        if (onEditEnd) onEditEnd();
      } else {
        console.error('Failed to save file edits');
      }
    } catch (error) {
      console.error('Error saving edited file:', error);
    }
  };

  const handleEditCancel = () => {
    setEditContent('');
    if (onEditEnd) onEditEnd();
  };

  return {
    editContent,
    setEditContent,
    currentFileContent,
    isAnimatingContent,
    animatedContent,
    handleAnimationComplete,
    handleEditSave,
    handleEditCancel
  };
};
