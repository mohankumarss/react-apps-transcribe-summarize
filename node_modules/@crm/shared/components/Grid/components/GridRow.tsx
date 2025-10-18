import React, { useCallback, useMemo } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridColumn, GridState, ResponsiveState } from '../types';
import { GridCell } from './GridCell';
import './GridRow.css';

export interface GridRowProps<T = any> {
  row: T;
  rowIndex: number;
  columns: GridColumn<T>[];
  isSelected: boolean;
  isExpanded: boolean;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  onExpand?: () => void;
  onCellClick?: (value: any, row: T, column: GridColumn<T>, event: React.MouseEvent) => void;
  onCellEdit?: (value: any, row: T, column: GridColumn<T>) => void;
  state: GridState<T>;
  actions: any;
  features: any;
  responsive: ResponsiveState;
  customComponent?: React.ComponentType<any>;
  customCellComponent?: React.ComponentType<any>;
}

export function GridRow<T = any>({
  row,
  rowIndex,
  columns,
  isSelected,
  isExpanded,
  style,
  onClick,
  onDoubleClick,
  onExpand,
  onCellClick,
  onCellEdit,
  state,
  actions,
  features,
  responsive,
  customComponent: CustomRow,
  customCellComponent
}: GridRowProps<T>) {
  const { getThemeClass } = useThemeStyles();

  // Get row key
  const getRowKey = useCallback((row: T): string | number => {
    return (row as any).id || rowIndex;
  }, [row, rowIndex]);

  // Handle cell click
  const handleCellClick = useCallback((
    value: any,
    column: GridColumn<T>,
    event: React.MouseEvent
  ) => {
    // Prevent row click when clicking on cell
    event.stopPropagation();
    onCellClick?.(value, row, column, event);
  }, [onCellClick, row]);

  // Handle cell edit
  const handleCellEdit = useCallback((value: any, column: GridColumn<T>) => {
    onCellEdit?.(value, row, column);
  }, [onCellEdit, row]);

  // Handle selection checkbox
  const handleSelectionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const rowKey = getRowKey(row);
    
    if (event.target.checked) {
      actions.selectRow(rowKey);
    } else {
      actions.deselectRow(rowKey);
    }
  }, [actions, getRowKey, row]);

  // Handle expand/collapse
  const handleExpandClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onExpand?.();
  }, [onExpand]);

  // Row classes
  const rowClasses = useMemo(() => {
    const classes = ['grid__row'];
    
    if (isSelected) classes.push('grid__row--selected');
    if (isExpanded) classes.push('grid__row--expanded');
    if (features.grouping && (row as any).__isGroupRow) classes.push('grid__row--group');
    if (rowIndex % 2 === 0) classes.push('grid__row--even');
    else classes.push('grid__row--odd');
    
    return classes.join(' ');
  }, [isSelected, isExpanded, features.grouping, row, rowIndex]);

  // Custom row component
  if (CustomRow) {
    return (
      <CustomRow
        row={row}
        rowIndex={rowIndex}
        columns={columns}
        isSelected={isSelected}
        isExpanded={isExpanded}
        style={style}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onExpand={onExpand}
        onCellClick={onCellClick}
        onCellEdit={onCellEdit}
        state={state}
        actions={actions}
        features={features}
        responsive={responsive}
      />
    );
  }

  return (
    <div
      className={getThemeClass(rowClasses)}
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      role="row"
      aria-rowindex={rowIndex + 2} // +2 because header is row 1
      aria-selected={isSelected}
      tabIndex={0}
    >
      {/* Selection Column */}
      {features.selection?.mode !== 'none' && (
        <div className="grid__cell grid__cell--selection">
          {features.selection?.mode === 'multiple' && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectionChange}
              aria-label={`Select row ${rowIndex + 1}`}
              tabIndex={-1}
            />
          )}
          {features.selection?.mode === 'single' && (
            <input
              type="radio"
              name="grid-selection"
              checked={isSelected}
              onChange={handleSelectionChange}
              aria-label={`Select row ${rowIndex + 1}`}
              tabIndex={-1}
            />
          )}
        </div>
      )}

      {/* Expand/Collapse Column */}
      {features.grouping && (
        <div className="grid__cell grid__cell--expand">
          <button
            className="grid__expand-button"
            onClick={handleExpandClick}
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            aria-expanded={isExpanded}
            tabIndex={-1}
          >
            <span className={`grid__expand-icon ${isExpanded ? 'grid__expand-icon--expanded' : ''}`}>
              ▶
            </span>
          </button>
        </div>
      )}

      {/* Data Columns */}
      {columns.map((column, columnIndex) => {
        const value = (row as any)[column.key];
        const isEditing = state.editingCell?.rowIndex === rowIndex && 
                         state.editingCell?.columnKey === String(column.key);

        return (
          <GridCell
            key={String(column.key)}
            value={value}
            row={row}
            column={column}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            isSelected={isSelected}
            isEditing={isEditing}
            onClick={(event) => handleCellClick(value, column, event)}
            onEdit={handleCellEdit}
            onStartEdit={() => actions.startCellEdit(rowIndex, String(column.key))}
            onStopEdit={() => actions.stopCellEdit()}
            state={state}
            actions={actions}
            features={features}
            responsive={responsive}
            customComponent={customCellComponent}
          />
        );
      })}
    </div>
  );
}
