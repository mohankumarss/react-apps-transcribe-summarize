import React from 'react';
import { GridState, ResponsiveState } from '../types';
import './GridToolbar.css';
export interface GridToolbarProps<T = any> {
    state: GridState<T>;
    actions: any;
    features: any;
    responsive: ResponsiveState;
    customComponent?: React.ComponentType<any>;
}
export declare function GridToolbar<T = any>({ state, actions, features, responsive, customComponent: CustomToolbar }: GridToolbarProps<T>): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=GridToolbar.d.ts.map