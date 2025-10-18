import React from 'react';
import { GridState, ResponsiveState } from '../types';
import './GridPagination.css';
export interface GridPaginationProps<T = any> {
    state: GridState<T>;
    actions: any;
    features: any;
    responsive: ResponsiveState;
    customComponent?: React.ComponentType<any>;
}
export declare function GridPagination<T = any>({ state, actions, features, responsive, customComponent: CustomPagination }: GridPaginationProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GridPagination.d.ts.map