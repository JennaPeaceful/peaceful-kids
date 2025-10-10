import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to top of page when route changes.
 * Uses useLayoutEffect to scroll BEFORE paint for instant effect.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top instantly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });

    // Also scroll any scrollable containers to top
    const scrollableElements = document.querySelectorAll('[data-scroll-reset]');
    scrollableElements.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
