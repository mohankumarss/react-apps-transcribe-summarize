/**
 * Theme Switcher Component
 *
 * Provides UI for switching between themes
 */
import React from 'react';
export interface ThemeSwitcherProps {
    /**
     * Display style for the switcher
     */
    variant?: 'dropdown' | 'toggle' | 'buttons';
    /**
     * Size of the switcher
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Show theme labels
     */
    showLabels?: boolean;
    /**
     * Show theme icons
     */
    showIcons?: boolean;
    /**
     * Custom class name
     */
    className?: string;
    /**
     * Disabled state
     */
    disabled?: boolean;
    /**
     * Only show if theme switching is enabled
     */
    hideIfDisabled?: boolean;
}
export declare const ThemeSwitcher: React.FC<ThemeSwitcherProps>;
//# sourceMappingURL=ThemeSwitcher.d.ts.map