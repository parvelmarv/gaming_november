import { useCallback } from 'react';

interface ScreenOrientationType extends ScreenOrientation {
  lock(orientation: 'landscape' | 'portrait'): Promise<void>;
  unlock(): Promise<void>;
}

export const useOrientation = () => {
  const hasOrientationSupport = useCallback(() => {
    return !!(screen.orientation && 'lock' in screen.orientation);
  }, []);

  const lockOrientation = useCallback(async (orientation: 'landscape' | 'portrait') => {
    if (!hasOrientationSupport()) return;

    try {
      await (screen.orientation as ScreenOrientationType).lock(orientation);
    } catch (error) {
      console.debug('Orientation lock not available:', error);
    }
  }, [hasOrientationSupport]);

  const unlockOrientation = useCallback(async () => {
    if (!hasOrientationSupport()) return;

    try {
      await (screen.orientation as ScreenOrientationType).unlock();
    } catch (error) {
      console.debug('Orientation unlock not available:', error);
    }
  }, [hasOrientationSupport]);

  return {
    hasOrientationSupport,
    lockOrientation,
    unlockOrientation,
  };
}; 