import React from 'react';
import { useThemeStyles } from '../../../services/theme';
import { LoadingSpinner } from '../../LoadingSpinner';
import './GridLoadingOverlay.css';

export interface GridLoadingOverlayProps {
  customComponent?: React.ReactNode;
  message?: string;
}

export function GridLoadingOverlay({
  customComponent,
  message = 'Loading...'
}: GridLoadingOverlayProps) {
  const { getThemeClass } = useThemeStyles();

  if (customComponent) {
    return (
      <div className={getThemeClass('grid__loading-overlay')}>
        {customComponent}
      </div>
    );
  }

  return (
    <div className={getThemeClass('grid__loading-overlay')}>
      <div className="grid__loading-content">
        <LoadingSpinner size="large" />
        <span className="grid__loading-message">{message}</span>
      </div>
    </div>
  );
}
