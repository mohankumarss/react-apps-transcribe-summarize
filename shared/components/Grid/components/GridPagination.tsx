import React, { useCallback } from 'react';
import { useThemeStyles } from '../../../services/theme';
import { GridState, ResponsiveState } from '../types';
import { Pagination } from '../../Pagination';
import './GridPagination.css';

export interface GridPaginationProps<T = any> {
  state: GridState<T>;
  actions: any;
  features: any;
  responsive: ResponsiveState;
  customComponent?: React.ComponentType<any>;
}

export function GridPagination<T = any>({
  state,
  actions,
  features,
  responsive,
  customComponent: CustomPagination
}: GridPaginationProps<T>) {
  const { getThemeClass } = useThemeStyles();

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    actions.setCurrentPage(page);
  }, [actions]);

  // Handle page size change
  const handlePageSizeChange = useCallback((pageSize: number) => {
    actions.setPageSize(pageSize);
  }, [actions]);

  // Custom pagination component
  if (CustomPagination) {
    return (
      <CustomPagination
        state={state}
        actions={actions}
        features={features}
        responsive={responsive}
      />
    );
  }

  // Use the shared Pagination component
  return (
    <div className={getThemeClass('grid__pagination-container')}>
      <Pagination
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        totalRecords={state.totalRows}
        pageSize={state.pageSize}
        onPageChange={handlePageChange}
        showPageInfo={features.pagination?.showPageInfo !== false}
        showPageNumbers={features.pagination?.showPageNumbers !== false}
        maxPageNumbers={features.pagination?.maxPageNumbers || (responsive.isMobile ? 3 : 5)}
        className="grid__pagination"
      />
      
      {/* Page Size Selector */}
      {features.pagination?.showPageSizeSelector && responsive.isDesktop && (
        <div className="grid__page-size-selector">
          <label htmlFor="grid-page-size" className="grid__page-size-label">
            Rows per page:
          </label>
          <select
            id="grid-page-size"
            value={state.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className={getThemeClass('grid__page-size-select')}
          >
            {(features.pagination?.pageSizeOptions || [10, 20, 50, 100]).map((size: number) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
