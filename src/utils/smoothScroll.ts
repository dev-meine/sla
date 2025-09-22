/**
 * Utility for enhanced smooth scrolling
 */

// Register smooth scroll behavior
export const initSmoothScroll = (): void => {
  // Optimize scroll performance
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Add event listener for anchor links
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor && anchor.hash && anchor.pathname === window.location.pathname) {
      e.preventDefault();
      
      const targetElement = document.querySelector(anchor.hash);
      if (targetElement) {
        // Smooth scroll with improved performance
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without causing a page jump
        window.history.pushState(null, '', anchor.hash);
      }
    }
  });
};

// Debounce scroll events for better performance
export const debounceScroll = (callback: Function, wait = 10): () => void => {
  let timeout: number | undefined;
  
  return (): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(), wait) as unknown as number;
  };
};