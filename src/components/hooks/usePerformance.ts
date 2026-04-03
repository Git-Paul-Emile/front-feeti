import { useEffect, useCallback, useRef } from 'react';

// Custom hook for performance monitoring and optimization
export const usePerformance = () => {
  const performanceMetrics = useRef<{
    pageLoadTime: number;
    renderTime: number;
    navigationStartTime: number;
  }>({
    pageLoadTime: 0,
    renderTime: 0,
    navigationStartTime: Date.now()
  });

  // Measure page load performance
  const measurePageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        performanceMetrics.current.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
      }
    }
  }, []);

  // Measure render performance
  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      performanceMetrics.current.renderTime = renderTime;
    };
  }, []);

  // Optimize images loading
  const optimizeImages = useCallback(() => {
    if (typeof window !== 'undefined') {
      const images = document.querySelectorAll('img[data-lazy]');
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));

      return () => {
        images.forEach(img => imageObserver.unobserve(img));
      };
    }
  }, []);

  // Cleanup unused resources
  const cleanupResources = useCallback(() => {
    // Clean up event listeners, timers, etc.
    const timers = (window as any).__timers || [];
    timers.forEach((timer: number) => clearTimeout(timer));
    
    // Clear any cached data that's no longer needed
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old-') || name.includes('temp-')) {
            caches.delete(name);
          }
        });
      });
    }
  }, []);

  // Monitor memory usage
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      
      if (memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.9) {
        console.warn('High memory usage detected. Consider optimizing.');
        cleanupResources();
      }
    }
  }, [cleanupResources]);

  useEffect(() => {
    measurePageLoad();
    const cleanup = optimizeImages();
    
    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(monitorMemory, 30000);
    
    return () => {
      cleanup?.();
      clearInterval(memoryInterval);
    };
  }, [measurePageLoad, optimizeImages, monitorMemory]);

  return {
    measureRender,
    cleanupResources,
    performanceMetrics: performanceMetrics.current
  };
};

// Hook for debouncing expensive operations
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

// Hook for throttling scroll events
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T => {
  const inThrottle = useRef(false);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    }) as T,
    [callback, limit]
  );
};