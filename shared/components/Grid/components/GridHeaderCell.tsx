import React, { useState, useCallback, useRef } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridColumn, SortDirection, ResponsiveState } from '../types';
import './GridHeaderCell.css';

export interface GridHeaderCellProps<T = any> {
  column: GridColumn<T>;
  width: number;
  sortDirection?: SortDirection;
  sortPriority?: number;
  onSort?: () => void;
  onResize?: (width: number) => void;
  onFilter?: (filter: any) => void;
  features: any;
  responsive: ResponsiveState;
  columnIndex: number;
}

export function GridHeaderCell<T = any>({
  column,
  width,
  sortDirection,
  sortPriority,
  onSort,
  onResize,
  onFilter,
  features,
  responsive,
  columnIndex
}: GridHeaderCellProps<T>) {
  const { getThemeClass } = useThemeStyles();
  const [isResizing, setIsResizing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!column.resizable || !onResize) return;
    
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(column.minWidth || 50, startWidthRef.current + deltaX);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [column.resizable, column.minWidth, onResize, width]);

  // Handle sort click
  const handleSortClick = useCallback(() => {
    if (column.sortable && onSort) {
      onSort();
    }
  }, [column.sortable, onSort]);

  // Handle filter toggle
  const handleFilterToggle = useCallback(() => {
    if (column.filterable && features.filtering?.columnFilters) {
      setShowFilter(!showFilter);
    }
  }, [column.filterable, features.filtering, showFilter]);

  // Get sort icon
  const getSortIcon = () => {
    if (!column.sortable || !sortDirection) return null;
    
    const icon = sortDirection === 'asc' ? '↑' : '↓';
    const priority = sortPriority ? ` ${sortPriority}` : '';
    
    return (
      <span className="grid__sort-icon" aria-label={`Sorted ${sortDirection}ending`}>
        {icon}{priority}
      </span>
    );
  };

  // Get filter icon
  const getFilterIcon = () => {
    if (!column.filterable || !features.filtering?.columnFilters) return null;
    
    return (
      <button
        className={getThemeClass('grid__filter-toggle')}
        onClick={handleFilterToggle}
        aria-label="Toggle filter"
        aria-expanded={showFilter}
      >
        🔍
      </button>
    );
  };

  // Cell classes
  const cellClasses = [
    'grid__header-cell',
    column.headerClassName,
    column.pinned && `grid__header-cell--pinned-${column.pinned}`,
    isResizing && 'grid__header-cell--resizing',
    column.sortable && 'grid__header-cell--sortable',
    column.filterable && 'grid__header-cell--filterable'
  ].filter(Boolean).join(' ');

  // Custom header renderer
  if (column.headerRenderer) {
    return (
      <div
        className={getThemeClass(cellClasses)}
        style={{ width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
        role="columnheader"
        aria-colindex={columnIndex + 1}
        aria-sort={
          sortDirection === 'asc' ? 'ascending' :
          sortDirection === 'desc' ? 'descending' : 'none'
        }
      >
        {column.headerRenderer({
          column,
          sortDirection,
          onSort: handleSortClick,
          onFilter,
          onResize,
          isResizing
        })}
        
        {/* Resize Handle */}
        {column.resizable && onResize && (
          <div
            ref={resizeRef}
            className="grid__resize-handle"
            onMouseDown={handleResizeStart}
            aria-label="Resize column"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={getThemeClass(cellClasses)}
      style={{ width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
      role="columnheader"
      aria-colindex={columnIndex + 1}
      aria-sort={
        sortDirection === 'asc' ? 'ascending' :
        sortDirection === 'desc' ? 'descending' : 'none'
      }
      aria-label={column.ariaLabel || column.title}
      title={column.description}
    >
      {/* Header Content */}
      <div className="grid__header-content">
        {/* Title */}
        <span
          className="grid__header-title"
          onClick={handleSortClick}
          style={{ cursor: column.sortable ? 'pointer' : 'default' }}
        >
          {column.title}
        </span>

        {/* Sort Icon */}
        {getSortIcon()}

        {/* Filter Icon */}
        {getFilterIcon()}
      </div>

      {/* Filter Dropdown */}
      {showFilter && column.filterable && (
        <div className="grid__header-filter">
          {column.filterComponent ? (
            <column.filterComponent
              value={{ operator: 'contains', value: '' }}
              onChange={onFilter || (() => {})}
              onClear={() => onFilter?.(null)}
              options={column.filterOptions}
              placeholder={`Filter ${column.title}...`}
            />
          ) : (
            <input
              type="text"
              placeholder={`Filter ${column.title}...`}
              onChange={(e) => onFilter?.({ operator: 'contains', value: e.target.value })}
              className={getThemeClass('grid__filter-input')}
            />
          )}
        </div>
      )}

      {/* Resize Handle */}
      {column.resizable && onResize && (
        <div
          ref={resizeRef}
          className="grid__resize-handle"
          onMouseDown={handleResizeStart}
          aria-label="Resize column"
        />
      )}
    </div>
  );
}
