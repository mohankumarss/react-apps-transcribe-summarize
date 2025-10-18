import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridColumn, GridState, ResponsiveState, CellRendererProps } from '../types';
import './GridCell.css';

export interface GridCellProps<T = any> {
  value: any;
  row: T;
  column: GridColumn<T>;
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
  isEditing: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onEdit?: (value: any, column: GridColumn<T>) => void;
  onStartEdit?: () => void;
  onStopEdit?: () => void;
  state: GridState<T>;
  actions: any;
  features: any;
  responsive: ResponsiveState;
  customComponent?: React.ComponentType<any>;
}

export function GridCell<T = any>({
  value,
  row,
  column,
  rowIndex,
  columnIndex,
  isSelected,
  isEditing,
  onClick,
  onEdit,
  onStartEdit,
  onStopEdit,
  state,
  actions,
  features,
  responsive,
  customComponent: CustomCell
}: GridCellProps<T>) {
  const { getThemeClass } = useThemeStyles();
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      } else if (selectRef.current) {
        selectRef.current.focus();
      }
    }
  }, [isEditing]);

  // Handle edit save
  const handleSave = useCallback(() => {
    if (column.validator) {
      const error = column.validator(editValue, row);
      if (error) {
        // TODO: Show validation error
        return;
      }
    }
    
    onEdit?.(editValue, column);
    onStopEdit?.();
  }, [editValue, column, row, onEdit, onStopEdit]);

  // Handle edit cancel
  const handleCancel = useCallback(() => {
    setEditValue(value);
    onStopEdit?.();
  }, [value, onStopEdit]);

  // Handle key press in edit mode
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  // Handle double click to start editing
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (column.editable && features.editing?.mode === 'inline') {
      onStartEdit?.();
    }
  }, [column.editable, features.editing, onStartEdit]);

  // Get cell width from column
  const cellWidth = state.columnWidths[String(column.key)] || column.width || 120;

  // Cell classes
  const cellClasses = [
    'grid__cell',
    `grid__cell--type-${column.type || 'text'}`,
    column.cellClassName,
    typeof column.cellClassName === 'function' ? column.cellClassName(row) : '',
    column.pinned && `grid__cell--pinned-${column.pinned}`,
    isEditing && 'grid__cell--editing',
    column.editable && 'grid__cell--editable'
  ].filter(Boolean).join(' ');

  // Custom cell component
  if (CustomCell) {
    return (
      <CustomCell
        value={value}
        row={row}
        column={column}
        rowIndex={rowIndex}
        columnIndex={columnIndex}
        isSelected={isSelected}
        isEditing={isEditing}
        onClick={onClick}
        onEdit={onEdit}
        onStartEdit={onStartEdit}
        onStopEdit={onStopEdit}
        state={state}
        actions={actions}
        features={features}
        responsive={responsive}
      />
    );
  }

  // Render cell content
  const renderCellContent = () => {
    // Editing mode
    if (isEditing && column.editable) {
      if (column.editor) {
        return (
          <column.editor
            value={editValue}
            row={row}
            column={column}
            onSave={handleSave}
            onCancel={handleCancel}
            onValidate={column.validator ? (value: any) => column.validator!(value, row) : undefined}
          />
        );
      }

      // Default editor based on column type
      switch (column.type) {
        case 'boolean':
          return (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="checkbox"
              checked={editValue}
              onChange={(e) => setEditValue(e.target.checked)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
            />
          );
        
        case 'select':
          return (
            <select
              ref={selectRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
            >
              {column.filterOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        
        case 'date':
          return (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
            />
          );
        
        case 'number':
          return (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
            />
          );
        
        default:
          return (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
            />
          );
      }
    }

    // Custom renderer
    if (column.renderer) {
      const rendererProps: CellRendererProps<T> = {
        value,
        row,
        column,
        rowIndex,
        columnIndex,
        isSelected,
        isEditing,
        onEdit: onStartEdit,
        onSave: handleSave,
        onCancel: handleCancel
      };
      return column.renderer(rendererProps);
    }

    // Default rendering based on column type
    switch (column.type) {
      case 'boolean':
        return (
          <span className="grid__boolean-value">
            {value ? '✓' : '✗'}
          </span>
        );
      
      case 'date':
        return (
          <span className="grid__date-value">
            {value ? new Date(value).toLocaleDateString() : ''}
          </span>
        );
      
      case 'number':
        return (
          <span className="grid__number-value">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        );
      
      default:
        return (
          <span className="grid__text-value" title={String(value || '')}>
            {String(value || '')}
          </span>
        );
    }
  };

  return (
    <div
      className={getThemeClass(cellClasses)}
      style={{ 
        width: cellWidth,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth
      }}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      role="gridcell"
      aria-colindex={columnIndex + 1}
      tabIndex={isEditing ? -1 : 0}
      data-column={column.key}
      data-row={rowIndex}
    >
      <div className="grid__cell-content">
        {renderCellContent()}
      </div>
    </div>
  );
}
