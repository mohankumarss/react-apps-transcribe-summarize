import React from 'react';

// Base types
export type GridTheme = 'crm' | 'mfe' | 'custom';
export type SortDirection = 'asc' | 'desc' | null;
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in' | 'notIn';
export type SelectionMode = 'none' | 'single' | 'multiple';
export type EditMode = 'none' | 'inline' | 'popup' | 'batch';
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'custom';
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';
export type ColumnPinning = 'left' | 'right' | 'none';

// Responsive priority levels for column visibility
export type ResponsivePriority = 1 | 2 | 3;
// Priority 1: Essential columns (always visible on mobile)
// Priority 2: Important columns (visible on tablet and desktop)
// Priority 3: Secondary columns (visible only on desktop)

// Responsive types
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

// Filter types
export interface FilterValue {
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operator
}

export interface ColumnFilter {
  columnKey: string;
  filter: FilterValue;
}

export interface GlobalFilter {
  searchTerm: string;
  columns?: string[]; // Specific columns to search, if empty searches all
}

// Sort types
export interface SortColumn {
  columnKey: string;
  direction: SortDirection;
  priority?: number; // For multi-column sorting
}

// Selection types
export interface SelectionState<T = any> {
  selectedRows: Set<string | number>;
  selectedData: T[];
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}

// Column definition
export interface GridColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  flex?: number; // For flexible width
  type?: ColumnType;

  // Responsive behavior
  priority?: ResponsivePriority; // Column priority for responsive hiding (1=essential, 2=important, 3=secondary)

  // Behavior
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  resizable?: boolean;
  hideable?: boolean;
  pinned?: ColumnPinning;
  
  // Rendering
  renderer?: (props: CellRendererProps<T>) => React.ReactNode;
  headerRenderer?: (props: HeaderRendererProps<T>) => React.ReactNode;
  editor?: React.ComponentType<CellEditorProps<T>>;
  
  // Filtering
  filterComponent?: React.ComponentType<FilterComponentProps>;
  filterOptions?: any[]; // For select filters
  
  // Sorting
  sortFn?: (a: T, b: T, direction: SortDirection) => number;
  
  // Aggregation
  aggregator?: (values: any[]) => any;
  aggregatorRenderer?: (value: any) => React.ReactNode;
  
  // Validation
  validator?: (value: any, row: T) => string | null;
  
  // Styling
  className?: string;
  headerClassName?: string;
  cellClassName?: string | ((row: T) => string);
  
  // Accessibility
  ariaLabel?: string;
  description?: string;
}

// Cell renderer props
export interface CellRendererProps<T = any> {
  value: any;
  row: T;
  column: GridColumn<T>;
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
  isEditing: boolean;
  onEdit?: () => void;
  onSave?: (value: any) => void;
  onCancel?: () => void;
}

// Header renderer props
export interface HeaderRendererProps<T = any> {
  column: GridColumn<T>;
  sortDirection?: SortDirection;
  onSort?: (direction: SortDirection) => void;
  onFilter?: (filter: FilterValue) => void;
  onResize?: (width: number) => void;
  isResizing?: boolean;
}

// Cell editor props
export interface CellEditorProps<T = any> {
  value: any;
  row: T;
  column: GridColumn<T>;
  onSave: (value: any) => void;
  onCancel: () => void;
  onValidate?: (value: any) => string | null;
}

// Filter component props
export interface FilterComponentProps {
  value: FilterValue;
  onChange: (filter: FilterValue) => void;
  onClear: () => void;
  options?: any[];
  placeholder?: string;
}

// Pagination
export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  showQuickJumper?: boolean;
  position?: 'top' | 'bottom' | 'both';
}

// API Configuration
export interface ApiConfig {
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  dataPath?: string; // Path to data in response (e.g., 'data.items')
  totalPath?: string; // Path to total count (e.g., 'data.total')
  pageParam?: string; // Parameter name for page (default: 'page')
  pageSizeParam?: string; // Parameter name for page size (default: 'pageSize')
  sortParam?: string; // Parameter name for sort (default: 'sort')
  filterParam?: string; // Parameter name for filters (default: 'filter')
  searchParam?: string; // Parameter name for search (default: 'search')
  transform?: (data: any) => any; // Transform response data
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

// Grid features configuration
export interface GridFeatures {
  sorting?: boolean | { multiColumn?: boolean; defaultSort?: SortColumn[] };
  filtering?: boolean | { 
    columnFilters?: boolean; 
    globalSearch?: boolean; 
    advancedFilters?: boolean;
    filterPresets?: boolean;
  };
  pagination?: boolean | PaginationConfig;
  selection?: SelectionMode | { mode: SelectionMode; preserveSelection?: boolean };
  editing?: EditMode | { mode: EditMode; validateOnSave?: boolean };
  export?: boolean | { formats: ExportFormat[]; filename?: string };
  grouping?: boolean | { defaultGroups?: string[]; aggregation?: boolean };
  virtualization?: boolean | { rowHeight?: number; overscan?: number };
  responsive?: boolean | { breakpoints?: Record<string, number>; hiddenColumns?: Record<string, string[]> };
  accessibility?: boolean | { announceChanges?: boolean; keyboardNavigation?: boolean };
}

// Grid state
export interface GridState<T = any> {
  data: T[];
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  
  // Sorting
  sortColumns: SortColumn[];
  
  // Filtering
  columnFilters: ColumnFilter[];
  globalFilter: GlobalFilter;
  
  // Selection
  selection: SelectionState<T>;
  
  // Editing
  editingCell: { rowIndex: number; columnKey: string } | null;
  editingRow: number | null;
  
  // UI State
  columns: GridColumn<T>[];
  visibleColumns: GridColumn<T>[];
  columnWidths: Record<string, number>;
  expandedRows: Set<string | number>;
  
  // Grouping
  groupBy: string[];
  groupedData: any[];
}

// Grid events
export interface GridEvents<T = any> {
  onDataChange?: (data: T[]) => void;
  onSelectionChange?: (selection: SelectionState<T>) => void;
  onSortChange?: (sortColumns: SortColumn[]) => void;
  onFilterChange?: (filters: ColumnFilter[], globalFilter: GlobalFilter) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  onRowClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
  onRowDoubleClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
  onCellClick?: (value: any, row: T, column: GridColumn<T>, event: React.MouseEvent) => void;
  onCellEdit?: (value: any, row: T, column: GridColumn<T>) => void;
  onRowExpand?: (row: T, rowIndex: number, isExpanded: boolean) => void;
  onColumnResize?: (columnKey: string, width: number) => void;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  onExport?: (format: ExportFormat, data: T[]) => void;
  onError?: (error: any) => void;
}

// Main Grid props
export interface GridProps<T = any> extends GridEvents<T> {
  // Data
  data?: T[];
  columns: GridColumn<T>[];
  rowKey?: keyof T | ((row: T) => string | number);
  
  // Configuration
  theme?: GridTheme;
  features?: GridFeatures;
  apiConfig?: ApiConfig;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
  width?: number | string;
  
  // Initial state
  defaultSort?: SortColumn[];
  defaultFilters?: ColumnFilter[];
  defaultSelection?: (string | number)[];
  defaultPageSize?: number;
  
  // Loading states
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  
  // Customization
  customComponents?: {
    header?: React.ComponentType<any>;
    row?: React.ComponentType<any>;
    cell?: React.ComponentType<any>;
    pagination?: React.ComponentType<any>;
    toolbar?: React.ComponentType<any>;
    filter?: React.ComponentType<any>;
  };
  
  // Advanced
  virtualized?: boolean;
  stickyHeader?: boolean;
  stickyColumns?: boolean;
  zebra?: boolean;
  bordered?: boolean;
  compact?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
}
