import React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Button contents
     */
    children: React.ReactNode;
    /**
     * Button variant
     */
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    /**
     * Button size
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Loading state
     */
    loading?: boolean;
}
/**
 * Primary UI component for user interaction
 */
export declare const Button: React.FC<ButtonProps>;
//# sourceMappingURL=Button.d.ts.map