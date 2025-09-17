import { useState, useEffect } from 'react';

export const useResponsiveLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOffcanvasOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openMobileChat = () => {
    if (isMobile) {
      setIsOffcanvasOpen(true);
    }
  };

  const closeMobileChat = () => {
    setIsOffcanvasOpen(false);
  };

  return {
    isMobile,
    isOffcanvasOpen,
    openMobileChat,
    closeMobileChat
  };
};