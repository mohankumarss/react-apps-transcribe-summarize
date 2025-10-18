import React, { useState, useEffect } from 'react';
// import { LoadingSpinner } from '@shared/components';
import { useThemeStyles, useTheme, ThemeMode } from '@shared/services/theme';
import { getCallRecordsService } from '../services/callRecordsService';
import { CallRecord } from '../services/mockDataService';
import { logger } from '@shared/utils';
import { CallDetailPage } from './CallDetailPage';
import './CallDetailNewTabPage.css';

/**
 * CallDetailNewTabPage
 *
 * Standalone page for displaying call details in a new browser tab.
 * This component fetches the call record by ID from URL params and displays it
 * using CallDetailPage with displayContext='new-tab'.
 *
 * Supports thememode query parameter to apply theme before rendering:
 * - ?thememode=crm - Apply CRM theme
 * - ?thememode=mfe - Apply MFE theme
 */
export const CallDetailNewTabPage: React.FC = () => {
  const { getThemeClass } = useThemeStyles();
  const { switchTheme } = useTheme();
  const [callRecord, setCallRecord] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = getCallRecordsService();

  // Apply theme from URL parameter if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeMode = params.get('thememode');

    if (themeMode) {
      try {
        // Map string to ThemeMode enum
        const theme = themeMode.toLowerCase() === 'crm' ? ThemeMode.CRM : ThemeMode.MFE;
        switchTheme(theme);
        logger.info('Theme applied from URL parameter', { theme });
      } catch (err) {
        logger.error('Failed to apply theme from URL parameter', { themeMode, error: err });
      }
    }
  }, [switchTheme]);

  // Extract call ID from URL params
  useEffect(() => {
    const loadCallRecord = async () => {
      try {
        // Get call ID from URL search params
        const params = new URLSearchParams(window.location.search);
        const callId = params.get('id');

        if (!callId) {
          setError('No call ID provided');
          setLoading(false);
          logger.error('No call ID in URL params');
          return;
        }

        logger.info('Loading call record for new tab', { callId });

        // Fetch the call record
        const record = await apiService.getCallRecord(callId);

        if (record) {
          setCallRecord(record);
          // Update window title with call info
          document.title = `Call Details - ${record.name} - ${record.dateOfCall}`;
          logger.info('Call record loaded for new tab', { callId });
        } else {
          setError('Call record not found');
          logger.error('Call record not found', { callId });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load call record';
        setError(errorMessage);
        logger.error('Failed to load call record for new tab', err);
      } finally {
        setLoading(false);
      }
    };

    loadCallRecord();
  }, [apiService]);

  // Handle close window
  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className={getThemeClass('call-detail-new-tab-page call-detail-new-tab-page--loading')} aria-hidden="true">
        <div className="detail-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-line w-40" />
            <div className="skeleton-meta">
              <div className="skeleton-badge w-20" />
              <div className="skeleton-line w-24" />
              <div className="skeleton-line w-24" />
            </div>
          </div>
          <div className="skeleton-columns">
            <div className="skeleton-panel">
              <div className="skeleton-title w-28" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-line w-48" />
              ))}
            </div>
            <div className="skeleton-panel">
              <div className="skeleton-title w-28" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-line w-40" />
              ))}
            </div>
            <div className="skeleton-panel">
              <div className="skeleton-title w-28" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-line w-40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={getThemeClass('call-detail-new-tab-page call-detail-new-tab-page--error')}>
        <div className="error-container">
          <h2>Error Loading Call Details</h2>
          <p>{error}</p>
          <button onClick={handleClose} className="close-button">
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  if (!callRecord) {
    return (
      <div className={getThemeClass('call-detail-new-tab-page call-detail-new-tab-page--empty')}>
        <div className="empty-container">
          <h2>No Call Record</h2>
          <p>The requested call record could not be found.</p>
          <button onClick={handleClose} className="close-button">
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={getThemeClass('call-detail-new-tab-page')}>
      <CallDetailPage
        callRecord={callRecord}
        onBack={handleClose}
        displayContext="new-tab"
      />
    </div>
  );
};

export default CallDetailNewTabPage;

