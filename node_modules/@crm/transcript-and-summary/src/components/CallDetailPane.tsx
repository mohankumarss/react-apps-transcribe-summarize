import React, { useEffect, useRef, useCallback } from 'react';
import { useThemeStyles } from '@shared/services/theme';
import { CallRecord } from '../services/mockDataService';
import { CallDetailPage } from './CallDetailPage';
import './CallDetailPane.css';

export interface CallDetailPaneProps {
  isOpen: boolean;
  callRecord: CallRecord | null;
  onClose: () => void;
}

export const CallDetailPane: React.FC<CallDetailPaneProps> = ({
  isOpen,
  callRecord,
  onClose
}) => {
  const { getThemeClass } = useThemeStyles();
  const paneRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen || !callRecord) {
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
        {/* Pane Header */}
        <div className="pane-header">
          <h2 id="pane-title" className="pane-title">
            Call Details
          </h2>
          <button
            className="pane-close-button"
            onClick={onClose}
            aria-label="Close call details pane"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Pane Content */}
        <div className="pane-content">
          <CallDetailPage
            callRecord={callRecord}
            onBack={onClose}
            displayContext="pane"
          />
        </div>
      </div>
    </>
  );
};

export default CallDetailPane;

