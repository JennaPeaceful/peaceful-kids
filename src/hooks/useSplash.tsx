import { useState, useEffect } from 'react';

const SPLASH_STORAGE_KEY = 'hasSeenSplash';

export const useSplash = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if user has seen splash in this session
    const hasSeenSplash = sessionStorage.getItem(SPLASH_STORAGE_KEY);
    return !hasSeenSplash;
  });

  const completeSplash = () => {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
    setShowSplash(false);
  };

  return { showSplash, completeSplash };
};
