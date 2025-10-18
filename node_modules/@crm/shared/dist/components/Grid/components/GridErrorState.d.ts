import React from 'react';
import './GridErrorState.css';
export interface GridErrorStateProps {
    error: string;
    onRetry?: () => void;
    title?: string;
    icon?: React.ReactNode;
}
export declare function GridErrorState({ error, onRetry, title, icon }: GridErrorStateProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GridErrorState.d.ts.map