import React from 'react';
export type GridTheme = 'crm' | 'mfe' | 'custom';
export type SortDirection = 'asc' | 'desc' | null;
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in' | 'notIn';
export type SelectionMode = 'none' | 'single' | 'multiple';
export type EditMode = 'none' | 'inline' | 'popup' | 'batch';
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'custom';
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';
export type ColumnPinning = 'left' | 'right' | 'none';
export type ResponsivePriority = 1 | 2 | 3;
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
export interface FilterValue {
    operator: FilterOperator;
    value: any;
    value2?: any;
}
export interface ColumnFilter {
    columnKey: string;
    filter: FilterValue;
}
export interface GlobalFilter {
    searchTerm: string;
    columns?: string[];
}
export interface SortColumn {
    columnKey: string;
    direction: SortDirection;
    priority?: number;
}
export interface SelectionState<T = any> {
    selectedRows: Set<string | number>;
    selectedData: T[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
}
export interface GridColumn<T = any> {
    key: keyof T | string;
    title: string;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    flex?: number;
    type?: ColumnType;
    priority?: ResponsivePriority;
    sortable?: boolean;
    filterable?: boolean;
    editable?: boolean;
    resizable?: boolean;
    hideable?: boolean;
    pinned?: ColumnPinning;
    renderer?: (props: CellRendererProps<T>) => React.ReactNode;
    headerRenderer?: (props: HeaderRendererProps<T>) => React.ReactNode;
    editor?: React.ComponentType<CellEditorProps<T>>;
    filterComponent?: React.ComponentType<FilterComponentProps>;
    filterOptions?: any[];
    sortFn?: (a: T, b: T, direction: SortDirection) => number;
    aggregator?: (values: any[]) => any;
    aggregatorRenderer?: (value: any) => React.ReactNode;
    validator?: (value: any, row: T) => string | null;
    className?: string;
    headerClassName?: string;
    cellClassName?: string | ((row: T) => string);
    ariaLabel?: string;
    description?: string;
}
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
export interface HeaderRendererProps<T = any> {
    column: GridColumn<T>;
    sortDirection?: SortDirection;
    onSort?: (direction: SortDirection) => void;
    onFilter?: (filter: FilterValue) => void;
    onResize?: (width: number) => void;
    isResizing?: boolean;
}
export interface CellEditorProps<T = any> {
    value: any;
    row: T;
    column: GridColumn<T>;
    onSave: (value: any) => void;
    onCancel: () => void;
    onValidate?: (value: any) => string | null;
}
export interface FilterComponentProps {
    value: FilterValue;
    onChange: (filter: FilterValue) => void;
    onClear: () => void;
    options?: any[];
    placeholder?: string;
}
export interface PaginationConfig {
    enabled: boolean;
    pageSize: number;
    pageSizeOptions?: number[];
    showPageInfo?: boolean;
    showPageSizeSelector?: boolean;
    showQuickJumper?: boolean;
    position?: 'top' | 'bottom' | 'both';
}
export interface ApiConfig {
    endpoint?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    params?: Record<string, any>;
    dataPath?: string;
    totalPath?: string;
    pageParam?: string;
    pageSizeParam?: string;
    sortParam?: string;
    filterParam?: string;
    searchParam?: string;
    transform?: (data: any) => any;
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
}
export interface GridFeatures {
    sorting?: boolean | {
        multiColumn?: boolean;
        defaultSort?: SortColumn[];
    };
    filtering?: boolean | {
        columnFilters?: boolean;
        globalSearch?: boolean;
        advancedFilters?: boolean;
        filterPresets?: boolean;
    };
    pagination?: boolean | PaginationConfig;
    selection?: SelectionMode | {
        mode: SelectionMode;
        preserveSelection?: boolean;
    };
    editing?: EditMode | {
        mode: EditMode;
        validateOnSave?: boolean;
    };
    export?: boolean | {
        formats: ExportFormat[];
        filename?: string;
    };
    grouping?: boolean | {
        defaultGroups?: string[];
        aggregation?: boolean;
    };
    virtualization?: boolean | {
        rowHeight?: number;
        overscan?: number;
    };
    responsive?: boolean | {
        breakpoints?: Record<string, number>;
        hiddenColumns?: Record<string, string[]>;
    };
    accessibility?: boolean | {
        announceChanges?: boolean;
        keyboardNavigation?: boolean;
    };
}
export interface GridState<T = any> {
    data: T[];
    filteredData: T[];
    sortedData: T[];
    paginatedData: T[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    sortColumns: SortColumn[];
    columnFilters: ColumnFilter[];
    globalFilter: GlobalFilter;
    selection: SelectionState<T>;
    editingCell: {
        rowIndex: number;
        columnKey: string;
    } | null;
    editingRow: number | null;
    columns: GridColumn<T>[];
    visibleColumns: GridColumn<T>[];
    columnWidths: Record<string, number>;
    expandedRows: Set<string | number>;
    groupBy: string[];
    groupedData: any[];
}
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
export interface GridProps<T = any> extends GridEvents<T> {
    data?: T[];
    columns: GridColumn<T>[];
    rowKey?: keyof T | ((row: T) => string | number);
    theme?: GridTheme;
    features?: GridFeatures;
    apiConfig?: ApiConfig;
    className?: string;
    style?: React.CSSProperties;
    height?: number | string;
    width?: number | string;
    defaultSort?: SortColumn[];
    defaultFilters?: ColumnFilter[];
    defaultSelection?: (string | number)[];
    defaultPageSize?: number;
    loading?: boolean;
    loadingComponent?: React.ReactNode;
    emptyComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
    customComponents?: {
        header?: React.ComponentType<any>;
        row?: React.ComponentType<any>;
        cell?: React.ComponentType<any>;
        pagination?: React.ComponentType<any>;
        toolbar?: React.ComponentType<any>;
        filter?: React.ComponentType<any>;
    };
    virtualized?: boolean;
    stickyHeader?: boolean;
    stickyColumns?: boolean;
    zebra?: boolean;
    bordered?: boolean;
    compact?: boolean;
    ariaLabel?: string;
    ariaDescription?: string;
}
//# sourceMappingURL=types.d.ts.map