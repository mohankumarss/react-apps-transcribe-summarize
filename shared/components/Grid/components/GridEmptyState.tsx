import React from 'react';
import { useThemeStyles } from '../../../services/theme';
import './GridEmptyState.css';

export interface GridEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function GridEmptyState({
  title = 'No data available',
  description = 'There are no records to display.',
  icon,
  action
}: GridEmptyStateProps) {
  const { getThemeClass } = useThemeStyles();

  return (
    <div className={getThemeClass('grid__empty-state')}>
      <div className="grid__empty-content">
        {icon && (
          <div className="grid__empty-icon">
            {icon}
          </div>
        )}
        
        <h3 className="grid__empty-title">{title}</h3>
        
        {description && (
          <p className="grid__empty-description">{description}</p>
        )}
        
        {action && (
          <div className="grid__empty-action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
