import React, { useState, useCallback, useEffect } from 'react';
import { Button, LoadingSpinner } from '@shared/components';
import { useThemeStyles } from '@shared/services/theme';
import { CallRecord } from '../services/mockDataService';
import { getCallRecordsService } from '../services/callRecordsService';
import { ConversationTranscript } from './ConversationTranscript';
import { logger } from '@shared/utils';
import './CallDetailPage.css';

export type DisplayContext = 'normal' | 'pane' | 'new-tab';

export interface CallDetailPageProps {
  callRecord: CallRecord;
  onBack: () => void;
  displayContext?: DisplayContext;
}

export const CallDetailPage: React.FC<CallDetailPageProps> = ({
  callRecord: initialCallRecord,
  onBack,
  displayContext = 'normal'
}) => {
  const { getThemeClass } = useThemeStyles();
  const [callRecord, setCallRecord] = useState<CallRecord>(initialCallRecord);
  const [userNotes, setUserNotes] = useState(callRecord.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [copySuccess, setCopySuccess] = useState<'transcript' | 'summary' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summarySearchTerm, setSummarySearchTerm] = useState('');

  const apiService = getCallRecordsService();

  // Auto-save notes with debouncing
  useEffect(() => {
    if (userNotes === callRecord.notes) return;

    const timeoutId = setTimeout(async () => {
      setSavingNotes(true);
      try {
        const updatedRecord = await apiService.updateCallRecord(callRecord.id, { 
          notes: userNotes 
        });
        if (updatedRecord) {
          setCallRecord(updatedRecord);
          logger.info('User notes saved', { callId: callRecord.id });
        }
      } catch (error) {
        logger.error('Failed to save user notes', error);
      } finally {
        setSavingNotes(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [userNotes, callRecord.notes, callRecord.id, apiService]);

  // Copy to clipboard functionality
  const copyToClipboard = useCallback(async (text: string, type: 'transcript' | 'summary') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
      logger.info('Content copied to clipboard', { type });
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
    }
  }, []);

  // Highlight search terms in text
  const highlightText = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }, []);

  // Format call duration for display
  const formatCallDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(':');
    return `${minutes}m ${seconds}s`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to go back (only in normal context)
      if (event.key === 'Escape' && displayContext === 'normal') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayContext, onBack]);

  return (
    <div className={getThemeClass('call-detail-page')} data-context={displayContext} role="main" aria-label="Call details">
      {/* Header */}
      <div className="call-detail-header" role="banner">
        {/* <div className="header-navigation">
          {displayContext !== 'pane' && (
            <Button
              onClick={onBack}
              variant="secondary"
              size="small"
              className="back-button"
              aria-label="Go back to call list (Escape)"
              title="Go back to call list (Press Escape)"
            >
              ← Back
            </Button>
          )}
        </div> */}

        <div className="header-info-horizontal" role="region" aria-label="Call information">
          <div className="info-item">
            <span className="info-label">📅 Date</span>
            <span className="info-value">{formatDate(callRecord.dateOfCall)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🕐 Time</span>
            <span className="info-value">{callRecord.timeOfCall}</span>
          </div>
          <div className="info-item">
            <span className="info-label">⏱️ Duration</span>
            <span className="info-value">{formatCallDuration(callRecord.callLength)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🆔 Call ID</span>
            <span className="info-value info-value--monospace">{callRecord.callId}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Type</span>
            <span className={getThemeClass('info-value call-type-badge')}>{callRecord.callType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Agent</span>
            <span className="info-value">{callRecord.userName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Customer</span>
            <span className="info-value info-value--primary">{callRecord.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Phone</span>
            <span className="info-value">{callRecord.phoneNumber}</span>
          </div>
          <div className="info-item">
            <span className={getThemeClass(`call-direction-badge call-direction-badge--${callRecord.callDirection.toLowerCase()}`)} aria-label={`Call direction: ${callRecord.callDirection}`}>
              <span className="icon" aria-hidden="true">{callRecord.callDirection === 'Inbound' ? '⬇️' : '⬆️'}</span>
              <span className="label">{callRecord.callDirection}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Three-column body layout */}
      <div className="call-detail-body">
        {/* Column 1: Call Transcript */}
        <div className="transcript-column" role="region" aria-label="Call transcript">
          <div className="column-header">
            <div className="column-header-title">
              <span className="column-icon" aria-hidden="true">📝</span>
              <h3 id="transcript-heading">Call Transcript</h3>
            </div>
            <div className="column-actions">
              <div className="search-wrapper">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={getThemeClass('search-input')}
                  aria-label="Filter transcript content"
                  aria-describedby="transcript-heading"
                />
              </div>
              <Button
                onClick={() => copyToClipboard(callRecord.transcript, 'transcript')}
                variant="secondary"
                size="small"
                className="copy-button"
                aria-label={copySuccess === 'transcript' ? 'Transcript copied to clipboard' : 'Copy transcript to clipboard'}
                title="Copy transcript to clipboard"
              >
                {copySuccess === 'transcript' ? '✓ Copied' : '📋 Copy'}
              </Button>
            </div>
          </div>
          <div className="transcript-content" role="article">
            <ConversationTranscript
              transcript={callRecord.transcript}
              searchQuery={searchTerm}
            />
          </div>
        </div>

        {/* Column 2: AI-generated Summary */}
        <div className="summary-column" role="region" aria-label="Call summary">
          <div className="column-header">
            <div className="column-header-title">
              <span className="column-icon" aria-hidden="true">✨</span>
              <h3 id="summary-heading">Call Summary</h3>
            </div>
            <div className="column-actions">
              <div className="search-wrapper">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={summarySearchTerm}
                  onChange={(e) => setSummarySearchTerm(e.target.value)}
                  className={getThemeClass('search-input')}
                  aria-label="Filter summary content"
                  aria-describedby="summary-heading"
                />
              </div>
              <Button
                onClick={() => copyToClipboard(callRecord.summary, 'summary')}
                variant="secondary"
                size="small"
                className="copy-button"
                aria-label={copySuccess === 'summary' ? 'Summary copied to clipboard' : 'Copy summary to clipboard'}
                title="Copy summary to clipboard"
              >
                {copySuccess === 'summary' ? '✓ Copied' : '📋 Copy'}
              </Button>
            </div>
          </div>
          <div className="summary-content">
            <div className="summary-section">
              <h4>Call Purpose:</h4>
              <p>Customer inquiry regarding account closure status</p>
            </div>
            <div className="summary-section">
              <h4>Key Points:</h4>
              <ul className="key-points-list">
                <li>Customer submitted account closure request one week ago</li>
                <li>Account number: ACC123456789</li>
                <li>Customer expressed urgency for resolution</li>
                <li>Agent confirmed request is in progress</li>
              </ul>
              <div
                className="summary-text"
                dangerouslySetInnerHTML={{
                  __html: highlightText(callRecord.summary, summarySearchTerm)
                }}
              />
            </div>
            <div className="summary-section">
              <h4>Resolution:</h4>
              <p>Agent provided timeline of 2-3 business days for completion with email confirmation to follow</p>
            </div>
          </div>
        </div>

        {/* Column 3: User Notes Editor */}
        <div className="notes-column" role="region" aria-label="Contact notes editor">
          <div className="column-header">
            <div className="column-header-title">
              <span className="column-icon" aria-hidden="true">📌</span>
              <h3 id="notes-heading">Contact Notes</h3>
            </div>
            <div className="column-actions">
              <Button
                onClick={() => copyToClipboard(userNotes, 'transcript')}
                variant="secondary"
                size="small"
                className="copy-button"
                aria-label="Copy notes to clipboard"
                title="Copy notes to clipboard"
              >
                {copySuccess === 'transcript' ? '✓ Copied' : '📋 Copy'}
              </Button>
              {savingNotes && (
                <div className="saving-indicator" role="status" aria-live="polite" aria-label="Saving notes">
                  <LoadingSpinner size="small" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          </div>
          <div className="notes-content">
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              aria-label="Contact notes"
              aria-describedby="notes-heading"
              title="Edit contact notes. Changes are automatically saved."
              placeholder="Enter your notes here..."
              className={getThemeClass('notes-editor')}
              maxLength={1000}
            />
            <div className="notes-info" aria-live="polite">
              <span className="character-count">
                {userNotes.length}/1000
              </span>
              {savingNotes ? (
                <span className="auto-save-info">Saving…</span>
              ) : (
                userNotes === callRecord.notes ? (
                  <span className="auto-save-info" role="status">Saved ✓</span>
                ) : (
                  <span className="auto-save-info">Auto-saves after 1s</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallDetailPage;
