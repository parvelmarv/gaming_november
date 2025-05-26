export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const isLandscape = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth > window.innerHeight;
};

export const getDeviceInfo = () => {
  return {
    isMobile: isMobileDevice(),
    isLandscape: isLandscape(),
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0
  };
}; 