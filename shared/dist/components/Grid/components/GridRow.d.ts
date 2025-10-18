import React from 'react';
import { GridColumn, GridState, ResponsiveState } from '../types';
import './GridRow.css';
export interface GridRowProps<T = any> {
    row: T;
    rowIndex: number;
    columns: GridColumn<T>[];
    isSelected: boolean;
    isExpanded: boolean;
    style?: React.CSSProperties;
    onClick?: (event: React.MouseEvent) => void;
    onDoubleClick?: (event: React.MouseEvent) => void;
    onExpand?: () => void;
    onCellClick?: (value: any, row: T, column: GridColumn<T>, event: React.MouseEvent) => void;
    onCellEdit?: (value: any, row: T, column: GridColumn<T>) => void;
    state: GridState<T>;
    actions: any;
    features: any;
    responsive: ResponsiveState;
    customComponent?: React.ComponentType<any>;
    customCellComponent?: React.ComponentType<any>;
}
export declare function GridRow<T = any>({ row, rowIndex, columns, isSelected, isExpanded, style, onClick, onDoubleClick, onExpand, onCellClick, onCellEdit, state, actions, features, responsive, customComponent: CustomRow, customCellComponent }: GridRowProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GridRow.d.ts.map