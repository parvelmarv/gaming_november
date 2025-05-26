import { useState, useCallback, useEffect } from 'react';

interface UseFullscreenOptions {
  onEnter?: () => void;
  onExit?: () => void;
}

export const useFullscreen = (elementRef: React.RefObject<HTMLElement>, options?: UseFullscreenOptions) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    if (!elementRef.current) return;

    try {
      if (elementRef.current.requestFullscreen) {
        await elementRef.current.requestFullscreen();
      } else if ((elementRef.current as any).webkitRequestFullscreen) {
        await (elementRef.current as any).webkitRequestFullscreen();
      } else if ((elementRef.current as any).mozRequestFullScreen) {
        await (elementRef.current as any).mozRequestFullScreen();
      } else if ((elementRef.current as any).msRequestFullscreen) {
        await (elementRef.current as any).msRequestFullscreen();
      }
      options?.onEnter?.();
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  }, [elementRef, options]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      options?.onExit?.();
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  }, [options]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
      
      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}; 