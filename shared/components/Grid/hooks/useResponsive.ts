import { useState, useEffect, useMemo } from 'react';
import { GridColumn } from '../types';
import {
  getCurrentBreakpoint,
  generateResponsiveConfig,
  getVisibleColumns,
  ResponsiveColumnConfig,
  BREAKPOINTS
} from '../utils/responsive';

// Enhanced responsive state
export interface ResponsiveGridState {
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  containerWidth: number;
  visibleColumns: GridColumn[];
  responsiveConfig: Map<string, ResponsiveColumnConfig>;
  shouldStack: boolean;
  shouldCompact: boolean;
}

// Legacy interface for backward compatibility
export interface ResponsiveState {
  currentBreakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  visibleColumns: string[];
  shouldStack: boolean;
  shouldCompact: boolean;
}

export interface ResponsiveConfig {
  breakpoints: Record<string, number>;
  hiddenColumns: Record<string, string[]>;
  stackedLayout?: boolean;
  compactMode?: boolean;
}

// Hook for responsive grid behavior with enhanced column management
export function useResponsiveGrid<T = any>(
  columns: GridColumn<T>[],
  containerRef: React.RefObject<HTMLElement>
): ResponsiveGridState {
  const [screenWidth, setScreenWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Force initial container width measurement
  useEffect(() => {
    if (containerRef.current) {
      const initialWidth = containerRef.current.clientWidth;
      if (initialWidth > 0 && initialWidth !== containerWidth) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Setting initial container width:', initialWidth);
        }
        setContainerWidth(initialWidth);
      }
    }
  }, [containerRef.current, containerWidth]);

  // Generate responsive configuration
  const responsiveConfig = useMemo(() => {
    return generateResponsiveConfig(columns);
  }, [columns]);

  // Calculate current breakpoint and responsive state
  const responsiveState = useMemo(() => {
    // Use container width if available, otherwise fall back to screen width
    const effectiveWidth = containerWidth > 0 ? containerWidth : screenWidth;
    const breakpoint = getCurrentBreakpoint(effectiveWidth);
    const isMobile = breakpoint === 'mobile';
    const isTablet = breakpoint === 'tablet';
    const isDesktop = breakpoint === 'desktop';

    console.log('🎯 Breakpoint calculation:', {
      containerWidth,
      screenWidth,
      effectiveWidth,
      calculatedBreakpoint: breakpoint,
      breakpoints: { mobile: 768, tablet: 1024, desktop: 1025 }
    });

    const visibleColumns = getVisibleColumns(columns, breakpoint, responsiveConfig);

    return {
      currentBreakpoint: breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      containerWidth,
      visibleColumns,
      responsiveConfig,
      shouldStack: isMobile,
      shouldCompact: isMobile || isTablet
    };
  }, [columns, screenWidth, containerWidth, responsiveConfig]);

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      console.log('🪟 Window resized to:', window.innerWidth);
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle container resize using ResizeObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        console.log('📏 Container width updated:', width, 'Previous:', containerWidth);
        setContainerWidth(width);
      }
    };

    // Initial measurement with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updateContainerWidth();
    }, 100);

    // Set up ResizeObserver or fallback regardless of initial container availability
    let resizeObserver: ResizeObserver | null = null;
    let windowResizeHandler: (() => void) | null = null;

    const setupObserver = () => {
      if (containerRef.current && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          updateContainerWidth();
        });
        resizeObserver.observe(containerRef.current);
        console.log('📏 ResizeObserver set up for container');
      } else {
        // Fallback to window resize
        windowResizeHandler = () => updateContainerWidth();
        (window as any).addEventListener('resize', windowResizeHandler);
        console.log('📏 Window resize fallback set up');
      }
    };

    // Try to set up observer immediately
    setupObserver();

    // If container wasn't available, try again after a delay
    if (!containerRef.current) {
      const retryTimer = setTimeout(() => {
        setupObserver();
      }, 200);

      return () => {
        clearTimeout(timer);
        clearTimeout(retryTimer);
        if (resizeObserver) resizeObserver.disconnect();
        if (windowResizeHandler) (window as any).removeEventListener('resize', windowResizeHandler);
      };
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      if (windowResizeHandler) (window as any).removeEventListener('resize', windowResizeHandler);
    };
  }, [containerRef, containerWidth]);

  return responsiveState;
}

// Legacy hook for backward compatibility
export function useResponsive<T = any>(
  columns: GridColumn<T>[],
  config: ResponsiveConfig = {
    breakpoints: { mobile: 768, tablet: 1024, desktop: 1200 },
    hiddenColumns: { mobile: ['notes', 'callLength', 'timeOfCall'], tablet: ['notes'] }
  }
): ResponsiveState {
  const [screenWidth, setScreenWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1200; // Default for SSR
  });

  // Update screen width on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate current breakpoint
  const currentBreakpoint = useMemo(() => {
    const breakpoints = { mobile: 768, tablet: 1024, desktop: 1200, ...config.breakpoints };

    if (screenWidth < breakpoints.mobile) return 'mobile';
    if (screenWidth < breakpoints.tablet) return 'tablet';
    if (screenWidth < breakpoints.desktop) return 'desktop';
    return 'wide';
  }, [screenWidth, config.breakpoints]);

  // Calculate device type flags
  const deviceFlags = useMemo(() => ({
    isMobile: currentBreakpoint === 'mobile',
    isTablet: currentBreakpoint === 'tablet',
    isDesktop: currentBreakpoint === 'desktop' || currentBreakpoint === 'wide'
  }), [currentBreakpoint]);

  // Calculate visible columns based on breakpoint
  const visibleColumns = useMemo(() => {
    const hiddenColumns = config.hiddenColumns || { mobile: ['notes', 'callLength', 'timeOfCall'], tablet: ['notes'] };
    const hiddenForBreakpoint = hiddenColumns[currentBreakpoint] || [];

    return columns
      .filter(column => !hiddenForBreakpoint.includes(String(column.key)))
      .map(column => String(column.key));
  }, [columns, currentBreakpoint, config.hiddenColumns]);

  // Calculate layout flags
  const layoutFlags = useMemo(() => ({
    shouldStack: Boolean(config.stackedLayout) && deviceFlags.isMobile,
    shouldCompact: Boolean(config.compactMode) && (deviceFlags.isMobile || deviceFlags.isTablet)
  }), [config.stackedLayout, config.compactMode, deviceFlags]);

  return {
    currentBreakpoint,
    ...deviceFlags,
    screenWidth,
    visibleColumns,
    ...layoutFlags
  };
}

// Hook for responsive column widths
export function useResponsiveColumns<T = any>(
  columns: GridColumn<T>[],
  containerWidth: number,
  responsive: ResponsiveState
): GridColumn<T>[] {
  return useMemo(() => {
    if (!responsive.isDesktop) {
      // On mobile/tablet, adjust column widths
      const visibleCols = columns.filter(col => 
        responsive.visibleColumns.includes(String(col.key))
      );

      const totalFlexColumns = visibleCols.filter(col => col.flex).length;
      const fixedWidth = visibleCols
        .filter(col => !col.flex && col.width)
        .reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 0), 0);

      const availableWidth = containerWidth - fixedWidth;
      const flexWidth = totalFlexColumns > 0 ? availableWidth / totalFlexColumns : 0;

      return visibleCols.map(col => ({
        ...col,
        width: col.flex ? flexWidth : col.width || 120
      }));
    }

    return columns.filter(col => 
      responsive.visibleColumns.includes(String(col.key))
    );
  }, [columns, containerWidth, responsive]);
}

// Hook for responsive grid features
export function useResponsiveFeatures(responsive: ResponsiveState) {
  return useMemo(() => {
    const features = {
      // Disable some features on mobile for better performance
      virtualization: !responsive.isMobile,
      
      // Simplify pagination on mobile
      pagination: {
        showPageInfo: !responsive.isMobile,
        showPageSizeSelector: responsive.isDesktop,
        showQuickJumper: responsive.isDesktop,
        maxPageNumbers: responsive.isMobile ? 3 : responsive.isTablet ? 5 : 7
      },
      
      // Adjust filtering UI
      filtering: {
        columnFilters: responsive.isDesktop,
        globalSearch: true,
        advancedFilters: responsive.isDesktop,
        filterPresets: responsive.isDesktop
      },
      
      // Adjust selection UI
      selection: {
        showSelectAll: !responsive.isMobile,
        showBulkActions: !responsive.isMobile
      },
      
      // Adjust editing behavior
      editing: {
        inlineEditing: responsive.isDesktop,
        popupEditing: !responsive.isDesktop
      },
      
      // Export options
      export: {
        showInToolbar: responsive.isDesktop,
        showInMenu: !responsive.isDesktop
      }
    };

    return features;
  }, [responsive]);
}

// Hook for touch gestures on mobile
export function useTouchGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onPinch?: (scale: number) => void
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let startX = 0;
    let startY = 0;
    let startDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && onPinch) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && onPinch && startDistance > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = distance / startDistance;
        onPinch(scale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onPinch]);
}

// Utility function to get responsive styles
export function getResponsiveStyles(responsive: ResponsiveState) {
  return {
    container: {
      fontSize: responsive.isMobile ? '14px' : '16px',
      padding: responsive.isMobile ? '8px' : '16px'
    },
    
    header: {
      height: responsive.isMobile ? '40px' : '48px',
      fontSize: responsive.isMobile ? '12px' : '14px'
    },
    
    row: {
      height: responsive.isMobile ? '48px' : '56px',
      padding: responsive.isMobile ? '8px' : '12px'
    },
    
    cell: {
      padding: responsive.isMobile ? '4px 8px' : '8px 12px',
      fontSize: responsive.isMobile ? '12px' : '14px'
    },
    
    pagination: {
      buttonSize: responsive.isMobile ? 'small' : 'medium',
      spacing: responsive.isMobile ? '4px' : '8px'
    }
  };
}
