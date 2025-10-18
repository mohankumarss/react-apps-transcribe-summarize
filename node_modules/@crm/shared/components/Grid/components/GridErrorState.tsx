import React from 'react';
import { useThemeStyles } from '../../../services/theme';
import { Button } from '../../Button';
import './GridErrorState.css';

export interface GridErrorStateProps {
  error: string;
  onRetry?: () => void;
  title?: string;
  icon?: React.ReactNode;
}

export function GridErrorState({
  error,
  onRetry,
  title = 'Error loading data',
  icon
}: GridErrorStateProps) {
  const { getThemeClass } = useThemeStyles();

  return (
    <div className={getThemeClass('grid__error-state')}>
      <div className="grid__error-content">
        {icon && (
          <div className="grid__error-icon">
            {icon}
          </div>
        )}
        
        <h3 className="grid__error-title">{title}</h3>
        
        <p className="grid__error-message">{error}</p>
        
        {onRetry && (
          <div className="grid__error-action">
            <Button onClick={onRetry} variant="primary">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
