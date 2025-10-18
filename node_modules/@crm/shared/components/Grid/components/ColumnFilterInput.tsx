import React, { useState, useCallback } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridColumn, FilterValue } from '../types';
import './ColumnFilterInput.css';

export interface ColumnFilterInputProps<T = any> {
  column: GridColumn<T>;
  value: FilterValue;
  onChange: (filter: FilterValue) => void;
  onClear: () => void;
}

export function ColumnFilterInput<T = any>({
  column,
  value,
  onChange,
  onClear
}: ColumnFilterInputProps<T>) {
  const { getThemeClass } = useThemeStyles();
  const [inputValue, setInputValue] = useState(value.value || '');

  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    
    if (newValue.trim() === '') {
      onClear();
    } else {
      const operator = column.type === 'text' ? 'contains' : 'equals';
      onChange({ operator, value: newValue });
    }
  }, [column.type, onChange, onClear]);

  const handleSelectChange = useCallback((newValue: string) => {
    if (newValue === '') {
      onClear();
    } else {
      onChange({ operator: 'equals', value: newValue });
    }
  }, [onChange, onClear]);

  // Render based on column type
  switch (column.type) {
    case 'select':
      return (
        <select
          value={value.value || ''}
          onChange={(e) => handleSelectChange(e.target.value)}
          className={getThemeClass('column-filter-select')}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">All</option>
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
          type="date"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className={getThemeClass('column-filter-input')}
          onClick={(e) => e.stopPropagation()}
          placeholder="Filter date..."
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className={getThemeClass('column-filter-input')}
          onClick={(e) => e.stopPropagation()}
          placeholder="Filter number..."
        />
      );

    default: // text
      return (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className={getThemeClass('column-filter-input')}
          onClick={(e) => e.stopPropagation()}
          placeholder={`Filter ${column.title.toLowerCase()}...`}
        />
      );
  }
}
