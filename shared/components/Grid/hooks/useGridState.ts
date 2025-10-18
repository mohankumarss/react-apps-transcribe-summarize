import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  GridState, 
  GridColumn, 
  SortColumn, 
  ColumnFilter, 
  GlobalFilter, 
  SelectionState,
  GridProps 
} from '../types';

export function useGridState<T = any>(props: GridProps<T>) {
  const {
    data = [],
    columns,
    rowKey = 'id',
    defaultSort = [],
    defaultFilters = [],
    defaultSelection = [],
    defaultPageSize = 20,
    features = {}
  } = props;

  // Get row key function
  const getRowKey = useCallback((row: T): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey as keyof T] as string | number;
  }, [rowKey]);

  // Core state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  
  // Sorting state
  const [sortColumns, setSortColumns] = useState<SortColumn[]>(defaultSort);
  
  // Filtering state
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>(defaultFilters);
  const [globalFilter, setGlobalFilter] = useState<GlobalFilter>({ searchTerm: '' });
  
  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(defaultSelection)
  );
  
  // Editing state
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  
  // UI state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<GridColumn<T>[]>(columns);
  
  // Grouping state
  const [groupBy, setGroupBy] = useState<string[]>([]);

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply column filters
    columnFilters.forEach(({ columnKey, filter }) => {
      const column = columns.find(col => col.key === columnKey);
      if (!column) return;

      filtered = filtered.filter(row => {
        const value = row[columnKey as keyof T];
        const { operator, value: filterValue, value2 } = filter;

        switch (operator) {
          case 'equals':
            return value === filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          case 'gt':
            return Number(value) > Number(filterValue);
          case 'lt':
            return Number(value) < Number(filterValue);
          case 'gte':
            return Number(value) >= Number(filterValue);
          case 'lte':
            return Number(value) <= Number(filterValue);
          case 'between':
            return Number(value) >= Number(filterValue) && Number(value) <= Number(value2);
          case 'in':
            return Array.isArray(filterValue) && filterValue.includes(value);
          case 'notIn':
            return Array.isArray(filterValue) && !filterValue.includes(value);
          default:
            return true;
        }
      });
    });

    // Apply global filter
    if (globalFilter.searchTerm) {
      const searchTerm = globalFilter.searchTerm.toLowerCase();
      const searchColumns = globalFilter.columns || columns.map(col => String(col.key));
      
      filtered = filtered.filter(row =>
        searchColumns.some(columnKey => {
          const value = row[columnKey as keyof T];
          return String(value).toLowerCase().includes(searchTerm);
        })
      );
    }

    return filtered;
  }, [data, columnFilters, globalFilter, columns]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (sortColumns.length === 0) return filteredData;

    return [...filteredData].sort((a, b) => {
      for (const { columnKey, direction } of sortColumns) {
        if (!direction) continue;

        const column = columns.find(col => col.key === columnKey);
        let result = 0;

        if (column?.sortFn) {
          result = column.sortFn(a, b, direction);
        } else {
          const aValue = a[columnKey as keyof T];
          const bValue = b[columnKey as keyof T];
          
          if (aValue < bValue) result = -1;
          else if (aValue > bValue) result = 1;
          else result = 0;
        }

        if (direction === 'desc') result *= -1;
        if (result !== 0) return result;
      }
      return 0;
    });
  }, [filteredData, sortColumns, columns]);

  // Apply pagination
  const { paginatedData, totalPages } = useMemo(() => {
    const total = Math.ceil(sortedData.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      paginatedData: sortedData.slice(start, end),
      totalPages: total
    };
  }, [sortedData, currentPage, pageSize]);

  // Selection state
  const selection: SelectionState<T> = useMemo(() => {
    const selectedData = sortedData.filter(row => selectedRows.has(getRowKey(row)));
    const isAllSelected = sortedData.length > 0 && selectedData.length === sortedData.length;
    const isPartiallySelected = selectedData.length > 0 && !isAllSelected;

    return {
      selectedRows,
      selectedData,
      isAllSelected,
      isPartiallySelected
    };
  }, [selectedRows, sortedData, getRowKey]);

  // Grid state object
  const gridState: GridState<T> = {
    data,
    filteredData,
    sortedData,
    paginatedData,
    loading,
    error,
    currentPage,
    pageSize,
    totalRows: sortedData.length,
    totalPages,
    sortColumns,
    columnFilters,
    globalFilter,
    selection,
    editingCell,
    editingRow,
    columns,
    visibleColumns,
    columnWidths,
    expandedRows,
    groupBy,
    groupedData: [] // TODO: Implement grouping
  };

  // Actions
  const actions = {
    // Data
    setLoading,
    setError,
    
    // Pagination
    setCurrentPage: useCallback((page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]),
    setPageSize: useCallback((size: number) => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page
    }, []),
    
    // Sorting
    setSortColumns,
    toggleSort: useCallback((columnKey: string) => {
      setSortColumns(prev => {
        const existing = prev.find(col => col.columnKey === columnKey);
        if (!existing) {
          return [{ columnKey, direction: 'asc' }];
        }
        if (existing.direction === 'asc') {
          return prev.map(col => 
            col.columnKey === columnKey 
              ? { ...col, direction: 'desc' as const }
              : col
          );
        }
        return prev.filter(col => col.columnKey !== columnKey);
      });
    }, []),
    
    // Filtering
    setColumnFilters,
    setGlobalFilter,
    addColumnFilter: useCallback((columnKey: string, filter: any) => {
      setColumnFilters(prev => {
        const filtered = prev.filter(f => f.columnKey !== columnKey);
        return [...filtered, { columnKey, filter }];
      });
      setCurrentPage(1); // Reset to first page
    }, []),
    removeColumnFilter: useCallback((columnKey: string) => {
      setColumnFilters(prev => prev.filter(f => f.columnKey !== columnKey));
    }, []),
    clearAllFilters: useCallback(() => {
      setColumnFilters([]);
      setGlobalFilter({ searchTerm: '' });
      setCurrentPage(1);
    }, []),
    
    // Selection
    setSelectedRows,
    selectRow: useCallback((rowKey: string | number) => {
      setSelectedRows(prev => new Set([...prev, rowKey]));
    }, []),
    deselectRow: useCallback((rowKey: string | number) => {
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(rowKey);
        return newSet;
      });
    }, []),
    toggleRowSelection: useCallback((rowKey: string | number) => {
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(rowKey)) {
          newSet.delete(rowKey);
        } else {
          newSet.add(rowKey);
        }
        return newSet;
      });
    }, []),
    selectAllRows: useCallback(() => {
      setSelectedRows(new Set(sortedData.map(getRowKey)));
    }, [sortedData, getRowKey]),
    deselectAllRows: useCallback(() => {
      setSelectedRows(new Set());
    }, []),
    
    // Editing
    setEditingCell,
    setEditingRow,
    startCellEdit: useCallback((rowIndex: number, columnKey: string) => {
      setEditingCell({ rowIndex, columnKey });
    }, []),
    stopCellEdit: useCallback(() => {
      setEditingCell(null);
    }, []),
    
    // UI
    setColumnWidths,
    setExpandedRows,
    setVisibleColumns,
    toggleRowExpansion: useCallback((rowKey: string | number) => {
      setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(rowKey)) {
          newSet.delete(rowKey);
        } else {
          newSet.add(rowKey);
        }
        return newSet;
      });
    }, []),
    
    // Grouping
    setGroupBy
  };

  // Effect to call event handlers
  useEffect(() => {
    props.onSelectionChange?.(selection);
  }, [selection, props.onSelectionChange]);

  useEffect(() => {
    props.onSortChange?.(sortColumns);
  }, [sortColumns, props.onSortChange]);

  useEffect(() => {
    props.onFilterChange?.(columnFilters, globalFilter);
  }, [columnFilters, globalFilter, props.onFilterChange]);

  useEffect(() => {
    props.onPageChange?.(currentPage, pageSize);
  }, [currentPage, pageSize, props.onPageChange]);

  return { state: gridState, actions };
}
