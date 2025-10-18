import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useThemeStyles } from '../../services/theme';
import { GridProps, GridColumn, FilterValue, SortDirection } from './types';
import { ColumnFilterInput } from './components/ColumnFilterInput';
import { SimplePagination } from './components/SimplePagination';
import { useResponsiveGrid } from './hooks/useResponsive';
import { getResponsiveColumnStyles } from './utils/responsive';
import './Grid.css';

export function Grid<T = any>(props: GridProps<T>) {
  const {
    data = [],
    columns,
    className = '',
    style,
    height = '100%',
    width = '100%',
    theme = 'crm',
    loading = false,
    emptyComponent,
    loadingComponent,
    onRowClick,
    onRowDoubleClick,
    features
  } = props;

  const { getThemeClass } = useThemeStyles();
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive state management
  const responsive = useResponsiveGrid(columns, containerRef);

  // Priority-based responsive column filtering
  const responsiveColumns = useMemo(() => {
    const { currentBreakpoint } = responsive;

    return columns.filter(col => {
      // If no priority is specified, default to priority 2 (important)
      const priority = col.priority ?? 2;

      switch (currentBreakpoint) {
        case 'mobile':
          // Mobile: Show only priority 1 (essential) columns
          return priority === 1;
        case 'tablet':
          // Tablet: Show priority 1 (essential) and 2 (important) columns
          return priority <= 2;
        case 'desktop':
        default:
          // Desktop: Show all columns (priority 1, 2, and 3)
          return true;
      }
    });
  }, [columns, responsive.currentBreakpoint]);

  // Debug logging for responsive state (temporary for debugging)
  React.useEffect(() => {
    console.log('🔍 Grid Responsive State Changed:', {
      breakpoint: responsive.currentBreakpoint,
      containerWidth: responsive.containerWidth,
      screenWidth: responsive.screenWidth,
      responsiveColumns: responsiveColumns.map(col => ({
        key: String(col.key),
        priority: col.priority ?? 2
      })),
      totalColumns: columns.length,
      visibleColumns: responsiveColumns.length,
      isMobile: responsive.isMobile,
      isTablet: responsive.isTablet,
      isDesktop: responsive.isDesktop
    });
  }, [responsive.currentBreakpoint, responsive.containerWidth, responsive.screenWidth, responsiveColumns, columns.length, responsive.isMobile, responsive.isTablet, responsive.isDesktop]);

  // State management
  const [columnFilters, setColumnFilters] = useState<Record<string, FilterValue>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);

  // Extract selection mode from features prop
  const selectionMode = useMemo(() => {
    if (!features?.selection) return 'none';
    if (typeof features.selection === 'string') return features.selection;
    return features.selection.mode || 'none';
  }, [features?.selection]);

  // Extract pagination configuration from features prop
  const paginationEnabled = useMemo(() => {
    return features?.pagination !== false;
  }, [features?.pagination]);

  // Reset pagination when data changes (for API data updates)
  const dataLength = data.length;
  const [prevDataLength, setPrevDataLength] = useState(dataLength);

  React.useEffect(() => {
    if (dataLength !== prevDataLength) {
      setCurrentPage(1); // Reset to first page when data changes
      setPrevDataLength(dataLength);
    }
  }, [dataLength, prevDataLength]);

  // Clear selection when data changes (for API data updates)
  React.useEffect(() => {
    setSelectedRows(new Set());
    setFocusedRowIndex(-1);
  }, [data]);

  // Filter handlers
  const handleColumnFilter = useCallback((columnKey: string, filter: FilterValue) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: filter
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters({});
    // Reset to first page when filters are cleared
    setCurrentPage(1);
  }, []);

  // Sort handler
  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  }, [sortColumn, sortDirection]);

  // Selection handlers
  const getRowKey = useCallback((row: T, index: number): string | number => {
    return (row as any).id || index;
  }, []);

  const handleRowSelection = useCallback((row: T, index: number, event: React.MouseEvent) => {
    if (selectionMode === 'none') return;

    const rowKey = getRowKey(row, index);
    
    if (selectionMode === 'single') {
      setSelectedRows(new Set([rowKey]));
    } else if (selectionMode === 'multiple') {
      if (event.ctrlKey || event.metaKey) {
        setSelectedRows(prev => {
          const newSet = new Set(prev);
          if (newSet.has(rowKey)) {
            newSet.delete(rowKey);
          } else {
            newSet.add(rowKey);
          }
          return newSet;
        });
      } else {
        setSelectedRows(new Set([rowKey]));
      }
    }
  }, [selectionMode, getRowKey]);

  const handleSelectAll = useCallback(() => {
    if (selectionMode !== 'multiple') return;
    const allRowKeys = processedData.map((row, index) => getRowKey(row, index));
    setSelectedRows(new Set(allRowKeys));
  }, [selectionMode, getRowKey]);

  const handleDeselectAll = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  // Process data with filters and sorting
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnKey, filter]) => {
      if (!filter.value) return;

      filtered = filtered.filter(row => {
        const value = (row as any)[columnKey];
        const { operator, value: filterValue } = filter;

        switch (operator) {
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'equals':
            return value === filterValue;
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
          case 'in':
            return Array.isArray(filterValue) && filterValue.includes(value);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortColumn];
        const bValue = (b as any)[sortColumn];
        
        let result = 0;
        if (aValue < bValue) result = -1;
        else if (aValue > bValue) result = 1;
        
        return sortDirection === 'desc' ? -result : result;
      });
    }

    return filtered;
  }, [data, columnFilters, sortColumn, sortDirection]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize]);

  // Calculate pagination info
  const totalPages = Math.ceil(processedData.length / pageSize);
  const totalRecords = processedData.length;
  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalRecords);
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // Check selection states
  const isAllSelected = selectionMode === 'multiple' && 
    paginatedData.length > 0 && 
    paginatedData.every((row, index) => selectedRows.has(getRowKey(row, index)));

  const isPartiallySelected = selectionMode === 'multiple' && 
    selectedRows.size > 0 && 
    !isAllSelected;

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedRowIndex(prev => Math.min(prev + 1, paginatedData.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (focusedRowIndex >= 0 && focusedRowIndex < paginatedData.length) {
          const row = paginatedData[focusedRowIndex];
          if (event.key === ' ') {
            handleRowSelection(row, focusedRowIndex, event as any);
          } else {
            onRowDoubleClick?.(row, focusedRowIndex, event as any);
          }
        }
        break;
      case 'Escape':
        setFocusedRowIndex(-1);
        break;
    }
  }, [focusedRowIndex, paginatedData, handleRowSelection, onRowDoubleClick]);

  // Grid classes
  const gridClasses = useMemo(() => {
    const classes = [
      'grid',
      `grid--theme-${theme}`,
      'grid--simple',
      className
    ];

    if (loading) classes.push('grid--loading');

    // Add responsive classes
    if (responsive.isMobile) classes.push('grid--mobile');
    if (responsive.isTablet) classes.push('grid--tablet');
    if (responsive.isDesktop) classes.push('grid--desktop');
    if (responsive.shouldStack) classes.push('grid--stacked');
    if (responsive.shouldCompact) classes.push('grid--compact');

    return classes.join(' ');
  }, [theme, className, loading, responsive]);

  // Generate CSS custom properties for responsive grid templates
  const gridTemplateStyles = useMemo(() => {
    const selectionColumnWidth = selectionMode !== 'none' ? '40px ' : '';

    // Simple approach: generate template based on current responsive columns
    const currentTemplate = responsiveColumns.map(col => {
      const width = typeof col.width === 'number' ? col.width : 120;
      return `${width}px`;
    }).join(' ');

    const fullTemplate = selectionColumnWidth + currentTemplate;

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Grid Template:', {
        breakpoint: responsive.currentBreakpoint,
        template: fullTemplate,
        columnCount: responsiveColumns.length
      });
    }

    return {
      '--grid-template-columns': fullTemplate
    } as React.CSSProperties;
  }, [responsiveColumns, selectionMode, responsive.currentBreakpoint]);

  // Loading state
  if (loading) {
    return (
      <div className={getThemeClass(gridClasses)} style={{ height, width, ...style }}>
        <div className="grid__loading-overlay">
          {loadingComponent || <div>Loading...</div>}
        </div>
      </div>
    );
  }

  // Empty state (show when no data and not loading)
  if (processedData.length === 0 && !loading) {
    return (
      <div className={getThemeClass(gridClasses)} style={{ height, width, ...style }}>
        <div className="grid__empty-state">
          {emptyComponent || (
            <div>
              {data.length === 0 ? 'No data available' : 'No results match your filters'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={getThemeClass(gridClasses)}
      style={{ height, width, ...style, ...gridTemplateStyles }}
      role="grid"
    >
      {/* Debug indicator for current breakpoint (temporary for debugging) */}
      {/* <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '6px 12px',
        fontSize: '12px',
        borderRadius: '4px',
        zIndex: 1000,
        fontFamily: 'monospace'
      }}>
        {responsive.currentBreakpoint.toUpperCase()} | Container: {responsive.containerWidth}px | Screen: {responsive.screenWidth}px | Cols: {responsiveColumns.length}
      </div> */}
      {/* Header */}
      <div className="grid__header">
        {/* Header Row with Sorting */}
        <div className="grid__header-row" role="row">
          {/* Selection Column Header */}
          {selectionMode !== 'none' && (
            <div className="grid__header-cell grid__header-cell--selection">
              {selectionMode === 'multiple' && (
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleSelectAll();
                    } else {
                      handleDeselectAll();
                    }
                  }}
                  aria-label="Select all rows"
                />
              )}
            </div>
          )}

          {responsiveColumns.map((column, index) => {
            const isSorted = sortColumn === String(column.key);
            const sortIcon = isSorted ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '';
            const responsiveStyles = getResponsiveColumnStyles(column, responsive.currentBreakpoint, responsive.responsiveConfig);

            return (
              <div
                key={String(column.key)}
                className={`grid__header-cell ${column.sortable !== false ? 'grid__header-cell--sortable' : ''} ${isSorted ? 'grid__header-cell--sorted' : ''}`}
                style={{
                  ...responsiveStyles,
                  width: responsiveStyles.display === 'none' ? 0 : (column.width || 120)
                }}
                role="columnheader"
                aria-colindex={index + 1}
                aria-sort={isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                onClick={column.sortable !== false ? () => handleSort(String(column.key)) : undefined}
              >
                <div className="grid__header-content">
                  <span className="grid__header-title">
                    {column.title}{sortIcon}
                  </span>
                  {column.filterable !== false && (
                    <button
                      className="grid__filter-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFilters(!showFilters);
                      }}
                      aria-label="Toggle filters"
                      title="Toggle filters"
                    >
                      🔍
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div className="grid__filter-row" role="row">
            {/* Selection Column Filter */}
            {selectionMode !== 'none' && (
              <div className="grid__filter-cell grid__filter-cell--selection">
                {/* Empty space for selection column */}
              </div>
            )}

            {responsiveColumns.map((column) => {
              const responsiveStyles = getResponsiveColumnStyles(column, responsive.currentBreakpoint, responsive.responsiveConfig);

              return (
                <div
                  key={`filter-${String(column.key)}`}
                  className="grid__filter-cell"
                  style={{
                    ...responsiveStyles,
                    width: responsiveStyles.display === 'none' ? 0 : (column.width || 120)
                  }}
                >
                {column.filterable !== false && column.key !== 'actions' ? (
                  <ColumnFilterInput
                    column={column}
                    value={columnFilters[String(column.key)] || { operator: 'contains', value: '' }}
                    onChange={(filter) => handleColumnFilter(String(column.key), filter)}
                    onClear={() => handleColumnFilter(String(column.key), { operator: 'contains', value: '' })}
                  />
                ) : column.key === 'actions' ? (
                  <button
                    onClick={handleClearFilters}
                    className="grid__clear-filters-btn"
                    title="Clear all filters"
                  >
                    Clear All
                  </button>
                ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Body */}
      <div 
        className="grid__body"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="grid"
        aria-label="Data grid"
      >
        {paginatedData.map((row, rowIndex) => {
          const rowKey = getRowKey(row, rowIndex);
          const isSelected = selectedRows.has(rowKey);
          const isFocused = focusedRowIndex === rowIndex;

          return (
            <div
              key={rowIndex}
              className={`grid__row ${isSelected ? 'grid__row--selected' : ''} ${isFocused ? 'grid__row--focused' : ''}`}
              role="row"
              aria-rowindex={rowIndex + 2}
              aria-selected={isSelected}
              tabIndex={isFocused ? 0 : -1}
              onClick={(e) => {
                setFocusedRowIndex(rowIndex);
                handleRowSelection(row, rowIndex, e);
                onRowClick?.(row, rowIndex, e);
              }}
              onDoubleClick={(e) => onRowDoubleClick?.(row, rowIndex, e)}
              onFocus={() => setFocusedRowIndex(rowIndex)}
            >
              {/* Selection Column */}
              {selectionMode !== 'none' && (
                <div className="grid__cell grid__cell--selection">
                  {selectionMode === 'multiple' && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelection(row, rowIndex, e as any);
                      }}
                      aria-label={`Select row ${rowIndex + 1}`}
                      tabIndex={-1}
                    />
                  )}
                  {selectionMode === 'single' && (
                    <input
                      type="radio"
                      name="grid-selection"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelection(row, rowIndex, e as any);
                      }}
                      aria-label={`Select row ${rowIndex + 1}`}
                      tabIndex={-1}
                    />
                  )}
                </div>
              )}

              {responsiveColumns.map((column, columnIndex) => {
                const value = (row as any)[column.key];
                const responsiveStyles = getResponsiveColumnStyles(column, responsive.currentBreakpoint, responsive.responsiveConfig);

                return (
                  <div
                    key={String(column.key)}
                    className="grid__cell"
                    style={{
                      ...responsiveStyles,
                      width: responsiveStyles.display === 'none' ? 0 : (column.width || 120)
                    }}
                    role="gridcell"
                    aria-colindex={columnIndex + 1}
                  >
                    <div className="grid__cell-content">
                      {column.renderer ? (
                        column.renderer({
                          value,
                          row,
                          column,
                          rowIndex,
                          columnIndex,
                          isSelected: false,
                          isEditing: false
                        })
                      ) : (
                        String(value || '')
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {paginationEnabled && (
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          startRecord={startRecord}
          endRecord={endRecord}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageInfo={true}
          showPageSizeSelector={true}
          maxPageNumbers={5}
        />
      )}
    </div>
  );
}

// Export with display name for debugging
Grid.displayName = 'Grid';
