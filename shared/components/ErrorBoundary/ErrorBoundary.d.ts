import React, { Component, ErrorInfo, ReactNode } from 'react';
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetOnPropsChange?: boolean;
    resetKeys?: Array<string | number>;
}
/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 */
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private resetTimeoutId;
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentDidUpdate(prevProps: ErrorBoundaryProps): void;
    componentWillUnmount(): void;
    private reportError;
    private getCurrentUserId;
    private getSessionId;
    private resetErrorBoundary;
    private handleRetry;
    private handleReload;
    render(): string | number | boolean | Iterable<React.ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
/**
 * Hook for using Error Boundary with functional components
 */
export declare const useErrorHandler: () => (error: Error, errorInfo?: ErrorInfo) => never;
/**
 * Higher-order component for wrapping components with Error Boundary
 */
export declare const withErrorBoundary: <P extends object>(Component: React.ComponentType<P>, errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">) => {
    (props: P): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
/**
 * Simple Error Boundary for specific use cases
 */
export declare const SimpleErrorBoundary: React.FC<{
    children: ReactNode;
    message?: string;
}>;
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map