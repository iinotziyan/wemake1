
import React, { useState, useEffect, useRef } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypingAnimation = ({ text, speed = 1, onComplete }: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationIdRef = useRef<string>('');
  const hasStartedRef = useRef(false);

  // Generate a unique ID for this animation instance
  useEffect(() => {
    animationIdRef.current = `animation_${Date.now()}_${Math.random()}`;
    console.log('TypingAnimation started with ID:', animationIdRef.current, 'text length:', text.length);
  }, []);

  // Reset animation when text changes
  useEffect(() => {
    if (hasStartedRef.current) {
      console.log('TypingAnimation text changed, resetting:', { 
        newTextLength: text.length,
        animationId: animationIdRef.current 
      });
    }
    hasStartedRef.current = true;
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsCancelled(false);
  }, [text]);

  // Animation loop
  useEffect(() => {
    // Don't start if text is empty
    if (!text || text.length === 0) {
      setIsComplete(true);
      return;
    }

    if (currentIndex < text.length && !isComplete && !isCancelled) {
      timerRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else if (currentIndex >= text.length && !isComplete && !isCancelled) {
      setIsComplete(true);
      console.log('TypingAnimation completed:', animationIdRef.current);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete, isComplete, isCancelled]);

  // Listen for cancellation events
  useEffect(() => {
    const handleCancelTyping = () => {
      console.log('Cancellation received for animation:', animationIdRef.current);
      setIsCancelled(true);
      setIsComplete(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };

    window.addEventListener('cancelTypingAnimation', handleCancelTyping);
    
    return () => {
      window.removeEventListener('cancelTypingAnimation', handleCancelTyping);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Show full text immediately if empty or single character
  if (!text || text.length <= 1) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      {!isComplete && currentIndex < text.length && !isCancelled && (
        <span className="inline-block w-0.5 h-4 bg-white ml-0.5 animate-pulse opacity-75"></span>
      )}
    </span>
  );
};

export default TypingAnimation;
