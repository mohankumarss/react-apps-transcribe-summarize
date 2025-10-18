import React from 'react';
import { useThemeStyles } from '../../services/theme';
import { Button } from '../Button';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  showPageInfo = true,
  showPageNumbers = true,
  maxPageNumbers = 5,
  className = ''
}) => {
  const { getThemeClass } = useThemeStyles();

  // Calculate the range of records being shown
  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalRecords);
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  // Calculate which page numbers to show
  const getPageNumbers = () => {
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
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return showPageInfo ? (
      <div className={getThemeClass(`pagination ${className}`)}>
        <div className="pagination-info">
          Showing {startRecord} to {endRecord} of {totalRecords} records
        </div>
      </div>
    ) : null;
  }

  return (
    <div className={getThemeClass(`pagination ${className}`)}>
      {showPageInfo && (
        <div className="pagination-info">
          Showing {startRecord} to {endRecord} of {totalRecords} records
        </div>
      )}
      
      <div className="pagination-controls">
        {/* Previous Button */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          variant="secondary"
          size="small"
          className="pagination-btn pagination-prev"
        >
          Previous
        </Button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="pagination-numbers">
            {/* First page if not in range */}
            {pageNumbers[0] > 1 && (
              <>
                <Button
                  onClick={() => onPageChange(1)}
                  variant={1 === currentPage ? "primary" : "secondary"}
                  size="small"
                  className="pagination-btn pagination-number"
                >
                  1
                </Button>
                {pageNumbers[0] > 2 && (
                  <span className="pagination-ellipsis">...</span>
                )}
              </>
            )}

            {/* Page number buttons */}
            {pageNumbers.map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={page === currentPage ? "primary" : "secondary"}
                size="small"
                className={`pagination-btn pagination-number ${
                  page === currentPage ? 'active' : ''
                }`}
              >
                {page}
              </Button>
            ))}

            {/* Last page if not in range */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="pagination-ellipsis">...</span>
                )}
                <Button
                  onClick={() => onPageChange(totalPages)}
                  variant={totalPages === currentPage ? "primary" : "secondary"}
                  size="small"
                  className="pagination-btn pagination-number"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Next Button */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          variant="secondary"
          size="small"
          className="pagination-btn pagination-next"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
