import React, { useCallback, useMemo } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridColumn, GridState, SortDirection, ResponsiveState } from '../types';
import { GridHeaderCell } from './GridHeaderCell';
// import { FilterRow } from './FilterRow'; // TODO: Implement FilterRow for Grid
import './GridHeader.css';

export interface GridHeaderProps<T = any> {
  columns: GridColumn<T>[];
  state: GridState<T>;
  actions: any;
  features: any;
  responsive: ResponsiveState;
  customComponent?: React.ComponentType<any>;
}

export function GridHeader<T = any>({
  columns,
  state,
  actions,
  features,
  responsive,
  customComponent: CustomHeader
}: GridHeaderProps<T>) {
  const { getThemeClass } = useThemeStyles();

  // Handle column sorting
  const handleSort = useCallback((columnKey: string) => {
    if (!features.sorting) return;
    
    const currentSort = state.sortColumns.find(col => col.columnKey === columnKey);
    let newDirection: SortDirection = 'asc';
    
    if (currentSort) {
      if (currentSort.direction === 'asc') {
        newDirection = 'desc';
      } else {
        newDirection = null; // Remove sort
      }
    }
    
    if (features.sorting.multiColumn) {
      // Multi-column sorting
      if (newDirection === null) {
        actions.setSortColumns(state.sortColumns.filter(col => col.columnKey !== columnKey));
      } else {
        const existingIndex = state.sortColumns.findIndex(col => col.columnKey === columnKey);
        if (existingIndex >= 0) {
          const newSortColumns = [...state.sortColumns];
          newSortColumns[existingIndex] = { columnKey, direction: newDirection };
          actions.setSortColumns(newSortColumns);
        } else {
          actions.setSortColumns([...state.sortColumns, { columnKey, direction: newDirection }]);
        }
      }
    } else {
      // Single column sorting
      if (newDirection === null) {
        actions.setSortColumns([]);
      } else {
        actions.setSortColumns([{ columnKey, direction: newDirection }]);
      }
    }
  }, [features.sorting, state.sortColumns, actions]);

  // Handle column resize
  const handleResize = useCallback((columnKey: string, width: number) => {
    actions.setColumnWidths({
      ...state.columnWidths,
      [columnKey]: width
    });
  }, [actions, state.columnWidths]);

  // Handle column filter
  const handleFilter = useCallback((columnKey: string, filter: any) => {
    if (filter === null || filter === undefined || filter === '') {
      actions.removeColumnFilter(columnKey);
    } else {
      actions.addColumnFilter(columnKey, filter);
    }
  }, [actions]);

  // Calculate column widths
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    let totalFixedWidth = 0;
    let flexColumns = 0;

    columns.forEach(column => {
      const key = String(column.key);
      if (state.columnWidths[key]) {
        widths[key] = state.columnWidths[key];
        totalFixedWidth += state.columnWidths[key];
      } else if (typeof column.width === 'number') {
        widths[key] = column.width;
        totalFixedWidth += column.width;
      } else if (column.flex) {
        flexColumns += column.flex;
      } else {
        widths[key] = 120; // Default width
        totalFixedWidth += 120;
      }
    });

    // Calculate flex column widths
    if (flexColumns > 0) {
      const containerWidth = 1200; // TODO: Get actual container width
      const availableWidth = Math.max(0, containerWidth - totalFixedWidth);
      const flexUnit = availableWidth / flexColumns;

      columns.forEach(column => {
        const key = String(column.key);
        if (column.flex && !widths[key]) {
          widths[key] = Math.max(column.minWidth || 80, flexUnit * column.flex);
        }
      });
    }

    return widths;
  }, [columns, state.columnWidths]);

  // Get sort direction for column
  const getSortDirection = useCallback((columnKey: string): SortDirection => {
    const sortColumn = state.sortColumns.find(col => col.columnKey === columnKey);
    return sortColumn?.direction || null;
  }, [state.sortColumns]);

  // Get sort priority for multi-column sorting
  const getSortPriority = useCallback((columnKey: string): number | undefined => {
    if (!features.sorting?.multiColumn) return undefined;
    const index = state.sortColumns.findIndex(col => col.columnKey === columnKey);
    return index >= 0 ? index + 1 : undefined;
  }, [state.sortColumns, features.sorting]);

  // Custom header component
  if (CustomHeader) {
    return (
      <CustomHeader
        columns={columns}
        state={state}
        actions={actions}
        features={features}
        responsive={responsive}
      />
    );
  }

  // Stacked layout for mobile
  if (responsive.shouldStack) {
    return null; // No header in stacked mode
  }

  return (
    <div className={getThemeClass('grid__header')}>
      {/* Header Row */}
      <div 
        className="grid__header-row"
        role="row"
        aria-rowindex={1}
      >
        {/* Selection Column */}
        {features.selection?.mode !== 'none' && (
          <div className="grid__header-cell grid__header-cell--selection">
            {features.selection?.mode === 'multiple' && (
              <input
                type="checkbox"
                checked={state.selection.isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = state.selection.isPartiallySelected;
                }}
                onChange={(e) => {
                  if (e.target.checked) {
                    actions.selectAllRows();
                  } else {
                    actions.deselectAllRows();
                  }
                }}
                aria-label="Select all rows"
              />
            )}
          </div>
        )}

        {/* Column Headers */}
        {columns.map((column, index) => {
          const columnKey = String(column.key);
          const width = columnWidths[columnKey];
          const sortDirection = getSortDirection(columnKey);
          const sortPriority = getSortPriority(columnKey);

          return (
            <GridHeaderCell
              key={columnKey}
              column={column}
              width={width}
              sortDirection={sortDirection}
              sortPriority={sortPriority}
              onSort={() => handleSort(columnKey)}
              onResize={(newWidth) => handleResize(columnKey, newWidth)}
              onFilter={(filter) => handleFilter(columnKey, filter)}
              features={features}
              responsive={responsive}
              columnIndex={index}
            />
          );
        })}
      </div>

      {/* Filter Row - TODO: Implement FilterRow component */}
      {/* {features.filtering?.columnFilters && !responsive.isMobile && (
        <FilterRow
          columns={columns}
          state={state}
          actions={actions}
          features={features}
          responsive={responsive}
        />
      )} */}
    </div>
  );
}
