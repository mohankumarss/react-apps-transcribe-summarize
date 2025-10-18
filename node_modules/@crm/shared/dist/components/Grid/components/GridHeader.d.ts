import React from 'react';
import { GridColumn, GridState, ResponsiveState } from '../types';
import './GridHeader.css';
export interface GridHeaderProps<T = any> {
    columns: GridColumn<T>[];
    state: GridState<T>;
    actions: any;
    features: any;
    responsive: ResponsiveState;
    customComponent?: React.ComponentType<any>;
}
export declare function GridHeader<T = any>({ columns, state, actions, features, responsive, customComponent: CustomHeader }: GridHeaderProps<T>): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=GridHeader.d.ts.map