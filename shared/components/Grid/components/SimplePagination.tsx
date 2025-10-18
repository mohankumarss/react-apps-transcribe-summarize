import React, { useMemo } from 'react';
import { useThemeStyles } from '../../../services/theme';
import './SimplePagination.css';

export interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  startRecord: number;
  endRecord: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  maxPageNumbers?: number;
}

export function SimplePagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  startRecord,
  endRecord,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageInfo = true,
  showPageSizeSelector = true,
  maxPageNumbers = 5
}: SimplePaginationProps) {
  const { getThemeClass } = useThemeStyles();

  // Calculate which page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const halfRange = Math.floor(maxPageNumbers / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxPageNumbers) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPageNumbers + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages, maxPageNumbers]);

  // Always show pagination when component is rendered
  // The parent component controls whether to show pagination or not

  return (
    <div className={getThemeClass('simple-pagination')}>
      {/* Page Info */}
      {showPageInfo && (
        <div className="simple-pagination__info">
          Showing {startRecord} to {endRecord} of {totalRecords} records
        </div>
      )}

      {/* Pagination Controls */}
      <div className="simple-pagination__controls">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={getThemeClass('simple-pagination__btn simple-pagination__btn--prev')}
          aria-label="Previous page"
        >
          Previous
        </button>

        {/* Page Numbers */}
        {totalPages >= 1 && (
          <div className="simple-pagination__numbers">
            {/* First page if not in range */}
            {pageNumbers[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={getThemeClass(`simple-pagination__btn simple-pagination__btn--number ${1 === currentPage ? 'simple-pagination__btn--active' : ''}`)}
                  aria-label="Go to page 1"
                >
                  1
                </button>
                {pageNumbers[0] > 2 && (
                  <span className="simple-pagination__ellipsis">...</span>
                )}
              </>
            )}

            {/* Page number buttons */}
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={getThemeClass(`simple-pagination__btn simple-pagination__btn--number ${page === currentPage ? 'simple-pagination__btn--active' : ''}`)}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            {/* Last page if not in range */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="simple-pagination__ellipsis">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={getThemeClass(`simple-pagination__btn simple-pagination__btn--number ${totalPages === currentPage ? 'simple-pagination__btn--active' : ''}`)}
                  aria-label={`Go to page ${totalPages}`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={getThemeClass('simple-pagination__btn simple-pagination__btn--next')}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Page Size Selector */}
      {showPageSizeSelector && (
        <div className="simple-pagination__page-size">
          <label htmlFor="page-size-select" className="simple-pagination__page-size-label">
            Rows per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={getThemeClass('simple-pagination__page-size-select')}
          >
            {pageSizeOptions.map((size) => (
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
