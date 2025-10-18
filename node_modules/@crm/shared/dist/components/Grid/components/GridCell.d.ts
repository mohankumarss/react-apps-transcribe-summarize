import React from 'react';
import { GridColumn, GridState, ResponsiveState } from '../types';
import './GridCell.css';
export interface GridCellProps<T = any> {
    value: any;
    row: T;
    column: GridColumn<T>;
    rowIndex: number;
    columnIndex: number;
    isSelected: boolean;
    isEditing: boolean;
    onClick?: (event: React.MouseEvent) => void;
    onEdit?: (value: any, column: GridColumn<T>) => void;
    onStartEdit?: () => void;
    onStopEdit?: () => void;
    state: GridState<T>;
    actions: any;
    features: any;
    responsive: ResponsiveState;
    customComponent?: React.ComponentType<any>;
}
export declare function GridCell<T = any>({ value, row, column, rowIndex, columnIndex, isSelected, isEditing, onClick, onEdit, onStartEdit, onStopEdit, state, actions, features, responsive, customComponent: CustomCell }: GridCellProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GridCell.d.ts.map