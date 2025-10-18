import { GridColumn, SortDirection, ResponsiveState } from '../types';
import './GridHeaderCell.css';
export interface GridHeaderCellProps<T = any> {
    column: GridColumn<T>;
    width: number;
    sortDirection?: SortDirection;
    sortPriority?: number;
    onSort?: () => void;
    onResize?: (width: number) => void;
    onFilter?: (filter: any) => void;
    features: any;
    responsive: ResponsiveState;
    columnIndex: number;
}
export declare function GridHeaderCell<T = any>({ column, width, sortDirection, sortPriority, onSort, onResize, onFilter, features, responsive, columnIndex }: GridHeaderCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GridHeaderCell.d.ts.map