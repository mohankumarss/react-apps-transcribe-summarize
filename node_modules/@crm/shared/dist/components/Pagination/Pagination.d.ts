import React from 'react';
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
export declare const Pagination: React.FC<PaginationProps>;
//# sourceMappingURL=Pagination.d.ts.map