import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridColumn, GridState, ResponsiveState } from '../types';
import { GridRow } from './GridRow';
import './GridBody.css';

export interface GridBodyProps<T = any> {
  columns: GridColumn<T>[];
  state: GridState<T>;
  actions: any;
  features: any;
  responsive: ResponsiveState;
  onRowClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
  onRowDoubleClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
  onCellClick?: (value: any, row: T, column: GridColumn<T>, event: React.MouseEvent) => void;
  onCellEdit?: (value: any, row: T, column: GridColumn<T>) => void;
  onRowExpand?: (row: T, rowIndex: number, isExpanded: boolean) => void;
  customRowComponent?: React.ComponentType<any>;
  customCellComponent?: React.ComponentType<any>;
}

export function GridBody<T = any>({
  columns,
  state,
  actions,
  features,
  responsive,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  onCellEdit,
  onRowExpand,
  customRowComponent,
  customCellComponent
}: GridBodyProps<T>) {
  const { getThemeClass } = useThemeStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Virtual scrolling configuration
  const rowHeight = responsive.shouldCompact ? 40 : 56;
  const overscan = 5; // Number of extra rows to render outside viewport
  const data = state.paginatedData;

  // Get row key function
  const getRowKey = useCallback((row: T, index: number): string | number => {
    if (typeof state.columns[0]?.key === 'function') {
      return (state.columns[0].key as any)(row);
    }
    return (row as any).id || index;
  }, [state.columns]);

  // Update container height on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Virtual scrolling calculations
  const virtualItems = useMemo(() => {
    if (!features.virtualization || !containerHeight) {
      // Render all rows if virtualization is disabled or container height unknown
      return data.map((row, index) => ({
        index,
        start: index * rowHeight,
        size: rowHeight,
        row
      }));
    }

    const visibleStart = Math.floor(scrollTop / rowHeight);
    const visibleEnd = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight)
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(data.length - 1, visibleEnd + overscan);

    const items = [];
    for (let i = start; i <= end; i++) {
      items.push({
        index: i,
        start: i * rowHeight,
        size: rowHeight,
        row: data[i]
      });
    }

    return items;
  }, [data, containerHeight, scrollTop, rowHeight, overscan, features.virtualization]);

  // Total height for virtual scrolling
  const totalHeight = data.length * rowHeight;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle row selection
  const handleRowSelection = useCallback((row: T, event: React.MouseEvent) => {
    if (features.selection?.mode === 'none') return;

    const rowKey = getRowKey(row, 0);
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    if (features.selection?.mode === 'single') {
      if (state.selection.selectedRows.has(rowKey)) {
        actions.deselectRow(rowKey);
      } else {
        actions.setSelectedRows(new Set([rowKey]));
      }
    } else if (features.selection?.mode === 'multiple') {
      if (isCtrlOrCmd) {
        // Toggle selection
        actions.toggleRowSelection(rowKey);
      } else if (isShift) {
        // Range selection (TODO: implement range selection)
        actions.toggleRowSelection(rowKey);
      } else {
        // Single selection
        actions.setSelectedRows(new Set([rowKey]));
      }
    }
  }, [features.selection, getRowKey, state.selection.selectedRows, actions]);

  // Handle row click
  const handleRowClick = useCallback((row: T, rowIndex: number, event: React.MouseEvent) => {
    // Handle selection
    handleRowSelection(row, event);
    
    // Call external handler
    onRowClick?.(row, rowIndex, event);
  }, [handleRowSelection, onRowClick]);

  // Handle row double click
  const handleRowDoubleClick = useCallback((row: T, rowIndex: number, event: React.MouseEvent) => {
    onRowDoubleClick?.(row, rowIndex, event);
  }, [onRowDoubleClick]);

  // Handle row expansion
  const handleRowExpansion = useCallback((row: T, rowIndex: number) => {
    const rowKey = getRowKey(row, rowIndex);
    const isExpanded = state.expandedRows.has(rowKey);
    actions.toggleRowExpansion(rowKey);
    onRowExpand?.(row, rowIndex, !isExpanded);
  }, [getRowKey, state.expandedRows, actions, onRowExpand]);

  // Stacked layout for mobile
  if (responsive.shouldStack) {
    return (
      <div className={getThemeClass('grid__body grid__body--stacked')}>
        {data.map((row, index) => {
          const rowKey = getRowKey(row, index);
          const isSelected = state.selection.selectedRows.has(rowKey);
          const isExpanded = state.expandedRows.has(rowKey);

          return (
            <div
              key={rowKey}
              className={getThemeClass(`grid__row-card ${isSelected ? 'grid__row-card--selected' : ''}`)}
              onClick={(e) => handleRowClick(row, index, e)}
              onDoubleClick={(e) => handleRowDoubleClick(row, index, e)}
            >
              {columns.map((column) => {
                const value = (row as any)[column.key];
                return (
                  <div key={String(column.key)} className="grid__card-field" data-label={column.title}>
                    {column.renderer ? (
                      column.renderer({
                        value,
                        row,
                        column,
                        rowIndex: index,
                        columnIndex: 0,
                        isSelected,
                        isEditing: false
                      })
                    ) : (
                      String(value || '')
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={getThemeClass('grid__body')}
      onScroll={handleScroll}
      role="rowgroup"
      aria-rowcount={data.length}
    >
      {/* Virtual scrolling container */}
      <div
        className="grid__virtual-container"
        style={{ height: totalHeight, position: 'relative' }}
      >
        {virtualItems.map(({ index, start, row }) => {
          const rowKey = getRowKey(row, index);
          const isSelected = state.selection.selectedRows.has(rowKey);
          const isExpanded = state.expandedRows.has(rowKey);

          return (
            <GridRow
              key={rowKey}
              row={row}
              rowIndex={index}
              columns={columns}
              isSelected={isSelected}
              isExpanded={isExpanded}
              style={{
                position: 'absolute',
                top: start,
                left: 0,
                right: 0,
                height: rowHeight
              }}
              onClick={(e) => handleRowClick(row, index, e)}
              onDoubleClick={(e) => handleRowDoubleClick(row, index, e)}
              onExpand={() => handleRowExpansion(row, index)}
              onCellClick={onCellClick}
              onCellEdit={onCellEdit}
              state={state}
              actions={actions}
              features={features}
              responsive={responsive}
              customComponent={customRowComponent}
              customCellComponent={customCellComponent}
            />
          );
        })}
      </div>
    </div>
  );
}
