import React, { useEffect, useRef, useCallback } from 'react';
import { useThemeStyles } from '@shared/services/theme';
import { CallRecord } from '../services/mockDataService';
import { CallDetailPage } from './CallDetailPage';
import './CallDetailPane.css';

export interface CallDetailPaneProps {
  isOpen: boolean;
  openCalls: CallRecord[];
  activeCallId: string | null;
  onClose: () => void;
  onMinimize: () => void;
  onCloseTab: (callId: string) => void;
  onSwitchTab: (callId: string) => void;
}

export const CallDetailPane: React.FC<CallDetailPaneProps> = ({
  isOpen,
  openCalls,
  activeCallId,
  onClose,
  onMinimize,
  onCloseTab,
  onSwitchTab
}) => {
  const { getThemeClass } = useThemeStyles();
  const paneRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Get the active call record
  const activeCall = openCalls.find(call => call.id === activeCallId) || null;

  // Helper function to get call label for tab
  const getCallLabel = (call: CallRecord): string => {
    // Try to use customer name if available, otherwise use call ID
    if (call.name) {
      return `${call.name}`;
    }
    return call.id.substring(0, 8); // Show first 8 chars of ID
  };

  // Handle Escape key to close pane
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when pane is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click to close pane
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  }, [onClose]);

  // Focus management: trap focus within pane when open
  useEffect(() => {
    if (isOpen && paneRef.current) {
      // Store the previously focused element
      const previouslyFocusedElement = document.activeElement as HTMLElement;

      // Focus the close button or first focusable element in the pane
      const focusableElements = paneRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      // Return focus to previously focused element when pane closes
      return () => {
        if (previouslyFocusedElement && previouslyFocusedElement.focus) {
          previouslyFocusedElement.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen || openCalls.length === 0 || !activeCall) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={getThemeClass('call-detail-pane-backdrop')}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Pane */}
      <div
        ref={paneRef}
        className={getThemeClass('call-detail-pane')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pane-title"
      >
        {/* Pane Header with Tab Bar */}
        <div className="pane-header">
          <div className="pane-header-top">
            <h2 id="pane-title" className="pane-title">
              Call Details
            </h2>
            <div className="pane-header-buttons">
              <button
                className="pane-minimize-button"
                onClick={onMinimize}
                aria-label="Minimize call details pane"
                title="Minimize (Ctrl+M)"
              >
                −
              </button>
              <button
                className="pane-close-button"
                onClick={onClose}
                aria-label="Close all tabs and pane"
                title="Close all (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          {openCalls.length > 0 && (
            <div className="tab-bar" role="tablist" aria-label="Open calls">
              {openCalls.map((call) => (
                <div
                  key={call.id}
                  className={`tab ${activeCallId === call.id ? 'tab--active' : ''}`}
                  role="tab"
                  aria-selected={activeCallId === call.id}
                  aria-controls={`tab-panel-${call.id}`}
                  tabIndex={activeCallId === call.id ? 0 : -1}
                  onClick={() => onSwitchTab(call.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSwitchTab(call.id);
                    }
                  }}
                >
                  <span className="tab-label">{getCallLabel(call)}</span>
                  <button
                    className="tab-close-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(call.id);
                    }}
                    aria-label={`Close ${getCallLabel(call)} tab`}
                    title="Close tab"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pane Content */}
        <div className="pane-content">
          {activeCall && (
            <CallDetailPage
              callRecord={activeCall}
              onBack={onClose}
              displayContext="pane"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CallDetailPane;

