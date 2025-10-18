import React, { useCallback, useState } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridState, ResponsiveState } from '../types';
import { Button } from '../../Button';
import './GridToolbar.css';

export interface GridToolbarProps<T = any> {
  state: GridState<T>;
  actions: any;
  features: any;
  responsive: ResponsiveState;
  customComponent?: React.ComponentType<any>;
}

export function GridToolbar<T = any>({
  state,
  actions,
  features,
  responsive,
  customComponent: CustomToolbar
}: GridToolbarProps<T>) {
  const { getThemeClass } = useThemeStyles();
  const [searchTerm, setSearchTerm] = useState(state.globalFilter.searchTerm);

  // Handle global search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    actions.setGlobalFilter({ searchTerm: value });
  }, [actions]);

  // Handle export
  const handleExport = useCallback((format: string) => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`, state.sortedData);
  }, [state.sortedData]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    actions.clearAllFilters();
    setSearchTerm('');
  }, [actions]);

  // Custom toolbar component
  if (CustomToolbar) {
    return (
      <CustomToolbar
        state={state}
        actions={actions}
        features={features}
        responsive={responsive}
      />
    );
  }

  // Don't show toolbar if no features are enabled
  if (!features.filtering?.globalSearch && !features.export) {
    return null;
  }

  return (
    <div className={getThemeClass('grid__toolbar')}>
      <div className="grid__toolbar-left">
        {/* Global Search */}
        {features.filtering?.globalSearch && (
          <div className="grid__search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search all columns..."
              className={getThemeClass('grid__search-input')}
              aria-label="Search grid data"
            />
            <span className="grid__search-icon">🔍</span>
          </div>
        )}

        {/* Filter Summary */}
        {(state.columnFilters.length > 0 || state.globalFilter.searchTerm) && (
          <div className="grid__filter-summary">
            <span className="grid__filter-count">
              {state.columnFilters.length + (state.globalFilter.searchTerm ? 1 : 0)} filter(s) active
            </span>
            <Button
              onClick={handleClearFilters}
              variant="secondary"
              size="small"
              className="grid__clear-filters"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="grid__toolbar-right">
        {/* Selection Info */}
        {features.selection?.mode !== 'none' && state.selection.selectedRows.size > 0 && (
          <div className="grid__selection-info">
            <span className="grid__selection-count">
              {state.selection.selectedRows.size} selected
            </span>
            {features.selection?.mode === 'multiple' && (
              <Button
                onClick={actions.deselectAllRows}
                variant="secondary"
                size="small"
                className="grid__deselect-all"
              >
                Deselect All
              </Button>
            )}
          </div>
        )}

        {/* Export Options */}
        {features.export && (
          <div className="grid__export-container">
            {responsive.isDesktop ? (
              <div className="grid__export-buttons">
                <Button
                  onClick={() => handleExport('csv')}
                  variant="secondary"
                  size="small"
                  className="grid__export-btn"
                >
                  Export CSV
                </Button>
                <Button
                  onClick={() => handleExport('excel')}
                  variant="secondary"
                  size="small"
                  className="grid__export-btn"
                >
                  Export Excel
                </Button>
              </div>
            ) : (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleExport(e.target.value);
                    e.target.value = '';
                  }
                }}
                className={getThemeClass('grid__export-select')}
                aria-label="Export options"
              >
                <option value="">Export...</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
