import { GridColumn } from '../types';

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1025
} as const;

// Column priority for responsive hiding (lower number = higher priority)
export const COLUMN_PRIORITIES = {
  // Essential columns (always visible on mobile)
  id: 1,
  name: 1,
  title: 1,
  status: 1,
  actions: 1,
  action: 1,
  dateOfCall: 1,  // Date is essential for call logs
  phoneNumber: 1, // Phone number is essential for call logs

  // Important columns (visible on tablet+)
  date: 2,
  timeOfCall: 2,
  email: 2,
  inboundOutbound: 2,

  // Secondary columns (visible on desktop only)
  callLength: 3,
  notes: 3,
  description: 3
} as const;

// Responsive column configuration
export interface ResponsiveColumnConfig {
  mobile: {
    visible: boolean;
    width?: string | number;
    minWidth?: number;
    flex?: number;
  };
  tablet: {
    visible: boolean;
    width?: string | number;
    minWidth?: number;
    flex?: number;
  };
  desktop: {
    visible: boolean;
    width?: string | number;
    minWidth?: number;
    flex?: number;
  };
}

// Convert pixel width to flex ratio
export function pixelToFlexRatio(pixelWidth: number, totalWidth: number): number {
  return Math.round((pixelWidth / totalWidth) * 100) / 100;
}

// Calculate total width from columns
export function calculateTotalWidth(columns: GridColumn[]): number {
  return columns.reduce((total, col) => {
    const width = typeof col.width === 'number' ? col.width : 120;
    return total + width;
  }, 0);
}

// Get column priority
export function getColumnPriority(columnKey: string): number {
  const key = columnKey.toLowerCase();
  return COLUMN_PRIORITIES[key as keyof typeof COLUMN_PRIORITIES] || 4;
}

// Determine if column should be visible at breakpoint
export function shouldColumnBeVisible(
  column: GridColumn,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): boolean {
  const priority = getColumnPriority(String(column.key));

  switch (breakpoint) {
    case 'mobile':
      // On mobile, show only priority 1 columns (essential columns)
      return priority === 1;
    case 'tablet':
      // On tablet, show priority 1-2 columns (essential + important)
      return priority <= 2;
    case 'desktop':
      // On desktop, show all columns
      return true;
    default:
      return true;
  }
}

// Generate responsive column configuration
export function generateResponsiveConfig(columns: GridColumn[]): Map<string, ResponsiveColumnConfig> {
  const totalWidth = calculateTotalWidth(columns);
  const config = new Map<string, ResponsiveColumnConfig>();

  // Filter columns by breakpoint
  const mobileColumns = columns.filter(col => shouldColumnBeVisible(col, 'mobile'));
  const tabletColumns = columns.filter(col => shouldColumnBeVisible(col, 'tablet'));
  const desktopColumns = columns;

  // Debug logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Responsive Config Generation:', {
      totalColumns: columns.length,
      columnKeys: columns.map(col => String(col.key)),
      mobileColumns: mobileColumns.map(col => String(col.key)),
      tabletColumns: tabletColumns.map(col => String(col.key)),
      desktopColumns: desktopColumns.map(col => String(col.key))
    });
  }
  
  columns.forEach(column => {
    const pixelWidth = typeof column.width === 'number' ? column.width : 120;
    const columnKey = String(column.key);
    
    // Calculate flex ratios for each breakpoint
    const mobileVisible = mobileColumns.includes(column);
    const tabletVisible = tabletColumns.includes(column);
    const desktopVisible = desktopColumns.includes(column);
    
    const mobileTotalWidth = calculateTotalWidth(mobileColumns);
    const tabletTotalWidth = calculateTotalWidth(tabletColumns);
    const desktopTotalWidth = totalWidth;
    
    config.set(columnKey, {
      mobile: {
        visible: mobileVisible,
        flex: mobileVisible ? pixelToFlexRatio(pixelWidth, mobileTotalWidth) : 0,
        minWidth: mobileVisible ? Math.max(80, pixelWidth * 0.6) : 0
      },
      tablet: {
        visible: tabletVisible,
        flex: tabletVisible ? pixelToFlexRatio(pixelWidth, tabletTotalWidth) : 0,
        minWidth: tabletVisible ? Math.max(100, pixelWidth * 0.8) : 0
      },
      desktop: {
        visible: desktopVisible,
        flex: desktopVisible ? pixelToFlexRatio(pixelWidth, desktopTotalWidth) : 0,
        minWidth: desktopVisible ? Math.max(120, pixelWidth * 0.9) : 0
      }
    });
  });
  
  return config;
}

// Get current breakpoint
export function getCurrentBreakpoint(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

// Generate CSS Grid template columns
export function generateGridTemplate(
  columns: GridColumn[],
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  config: Map<string, ResponsiveColumnConfig>
): string {
  const visibleColumns = columns.filter(col => {
    const columnConfig = config.get(String(col.key));
    return columnConfig?.[breakpoint]?.visible ?? true;
  });

  return visibleColumns
    .map(col => {
      const columnConfig = config.get(String(col.key));
      const breakpointConfig = columnConfig?.[breakpoint];

      if (breakpointConfig?.flex) {
        return `${breakpointConfig.flex}fr`;
      }

      // Fallback to original width or default
      const width = typeof col.width === 'number' ? col.width : 120;
      return `${width}px`;
    })
    .join(' ');
}

// Get responsive styles for a column
export function getResponsiveColumnStyles(
  column: GridColumn,
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  config: Map<string, ResponsiveColumnConfig>
): React.CSSProperties {
  const columnConfig = config.get(String(column.key));
  const breakpointConfig = columnConfig?.[breakpoint];

  if (!breakpointConfig?.visible) {
    return { display: 'none' };
  }

  const styles: React.CSSProperties = {};

  if (breakpointConfig.minWidth) {
    styles.minWidth = `${breakpointConfig.minWidth}px`;
  }

  if (breakpointConfig.flex) {
    styles.flex = `${breakpointConfig.flex} 1 0`;
  }

  return styles;
}

// Get filtered columns for current breakpoint
export function getVisibleColumns(
  columns: GridColumn[],
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  config: Map<string, ResponsiveColumnConfig>
): GridColumn[] {
  const visibleColumns = columns.filter(col => {
    const columnConfig = config.get(String(col.key));
    const isVisible = columnConfig?.[breakpoint]?.visible ?? true;
    return isVisible;
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`Visible columns for ${breakpoint}:`, visibleColumns.map(col => String(col.key)));
  }
  return visibleColumns;
}
