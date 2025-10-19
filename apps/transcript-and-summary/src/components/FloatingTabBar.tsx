import React, { useCallback } from 'react';
import { useThemeStyles } from '@shared/services/theme';
import { CallRecord } from '../services/mockDataService';
import './FloatingTabBar.css';

export interface FloatingTabBarProps {
  openCalls: CallRecord[];
  activeCallId: string | null;
  onTabClick: (callId: string) => void;
  onTabClose: (callId: string) => void;
  onCloseAll: () => void;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  openCalls,
  activeCallId,
  onTabClick,
  onTabClose,
  onCloseAll
}) => {
  const { getThemeClass } = useThemeStyles();

  // Helper function to get call label for tab
  const getCallLabel = (call: CallRecord): string => {
    if (call.name) {
      return `${call.name}`;
    }
    return call.id.substring(0, 8);
  };

  // Don't render if no open calls
  if (openCalls.length === 0) {
    return null;
  }

  return (
    <div className={getThemeClass('floating-tab-bar')} role="tablist" aria-label="Open calls">
      {openCalls.map((call) => (
        <div
          key={call.id}
          className={`floating-tab ${activeCallId === call.id ? 'floating-tab--active' : ''}`}
          role="tab"
          aria-selected={activeCallId === call.id}
          aria-controls={`tab-panel-${call.id}`}
          tabIndex={activeCallId === call.id ? 0 : -1}
          onClick={() => onTabClick(call.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTabClick(call.id);
            }
          }}
        >
          <span className="floating-tab-label">{getCallLabel(call)}</span>
          <button
            className="floating-tab-close-button"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(call.id);
            }}
            aria-label={`Close ${getCallLabel(call)} tab`}
            title="Close tab"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Close All button */}
      <button
        className="floating-tab-close-all-button"
        onClick={onCloseAll}
        aria-label="Close all tabs"
        title="Close all tabs"
      >
        ✕ Close All
      </button>
    </div>
  );
};

export default FloatingTabBar;

