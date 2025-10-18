import React from 'react';
export interface LoadingSpinnerProps {
    /**
     * Size of the spinner
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Loading message to display
     */
    message?: string;
    /**
     * Additional CSS classes
     */
    className?: string;
}
/**
 * Loading spinner component with theme support
 */
export declare const LoadingSpinner: React.FC<LoadingSpinnerProps>;
//# sourceMappingURL=LoadingSpinner.d.ts.map