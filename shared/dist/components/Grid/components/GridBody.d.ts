import React from 'react';
import { GridColumn, GridState, ResponsiveState } from '../types';
import './GridBody.css';
export interface GridBodyProps<T = any> {
    columns: GridColumn<T>[];
    state: GridState<T>;
    actions: any;
    features: any;
    responsive: ResponsiveState;
    onRowClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
    onRowDoubleClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
    onCellClick?: (value: any, row: T, column: GridColumn<T>, event: React.MouseEvent) => void;
    onCellEdit?: (value: any, row: T, column: GridColumn<T>) => void;
    onRowExpand?: (row: T, rowIndex: number, isExpanded: boolean) => void;
    customRowComponent?: React.ComponentType<any>;
    customCellComponent?: React.ComponentType<any>;
}
export declare function GridBody<T = any>({ columns, state, actions, features, responsive, onRowClick, onRowDoubleClick, onCellClick, onCellEdit, onRowExpand, customRowComponent, customCellComponent }: GridBodyProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GridBody.d.ts.map