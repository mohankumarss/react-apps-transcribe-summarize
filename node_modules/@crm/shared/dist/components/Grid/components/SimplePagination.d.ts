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
export declare function SimplePagination({ currentPage, totalPages, totalRecords, pageSize, startRecord, endRecord, onPageChange, onPageSizeChange, pageSizeOptions, showPageInfo, showPageSizeSelector, maxPageNumbers }: SimplePaginationProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SimplePagination.d.ts.map