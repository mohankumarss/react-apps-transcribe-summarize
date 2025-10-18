import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, GridColumn, Grid } from '@shared/components';
import { useThemeStyles } from '@shared/services/theme';
import { CallRecord } from '../services/mockDataService';
import { getCallRecordsService } from '../services/callRecordsService';
import { logger } from '@shared/utils';
import { CallDetailPane } from './CallDetailPane';
import './CallLogPage.css';

// Define types for our grid (currently unused but ready for future features)



export interface CallLogPageProps {
  onViewCall: (callRecord: CallRecord) => void;
}

export const CallLogPage: React.FC<CallLogPageProps> = ({ onViewCall }) => {
  const { getThemeClass } = useThemeStyles();
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Remove pagination state - let Grid handle it
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set());
  // Local notes state for immediate UI updates without affecting other rows
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  // Pane state for collapsible detail view
  const [detailPaneOpen, setDetailPaneOpen] = useState(false);
  const [selectedCallForPane, setSelectedCallForPane] = useState<CallRecord | null>(null);



  const apiService = getCallRecordsService();

  // Load call records with filtering
  const loadCallRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all records - let Grid handle pagination
      logger.info('Starting to load call records...');
      const response = await apiService.getCallRecords(1, 1000); // Get all records

      logger.info('API response received:', {
        recordsCount: response.records.length,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages
      });

      setCallRecords(response.records);

      // Clear any existing local notes state when new data is loaded
      setLocalNotes({});

      logger.info('Call records loaded', {
        total: response.records.length,
        recordsSet: response.records.length > 0
      });

      // Debug: Log first record if available
      if (response.records.length > 0) {
        logger.info('First record:', response.records[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load call records';
      setError(errorMessage);
      logger.error('Failed to load call records', err);
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Load data on mount and page change
  useEffect(() => {
    loadCallRecords();
  }, [loadCallRecords]);

  // Handle notes auto-save
  const handleNotesChange = useCallback(async (callId: string, notes: string) => {
    setSavingNotes(prev => new Set(prev).add(callId));

    try {
      await apiService.updateCallRecord(callId, { notes });

      // Update the main call records state
      setCallRecords(prev => prev.map(record =>
        record.id === callId ? { ...record, notes } : record
      ));

      // Clear the local notes state for this record since it's now saved
      setLocalNotes(prev => {
        const newState = { ...prev };
        delete newState[callId];
        return newState;
      });

      logger.info('Notes saved', { callId, notesLength: notes.length });
    } catch (err) {
      logger.error('Failed to save notes', { callId, error: err });
    } finally {
      setSavingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(callId);
        return newSet;
      });
    }
  }, [apiService]);

  // Debounced notes save
  const debouncedNotesChange = useMemo(() => {
    const timeouts = new Map<string, NodeJS.Timeout>();
    
    return (callId: string, notes: string) => {
      // Clear existing timeout for this call
      const existingTimeout = timeouts.get(callId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout
      const timeout = setTimeout(() => {
        handleNotesChange(callId, notes);
        timeouts.delete(callId);
      }, 1000); // 1 second delay
      
      timeouts.set(callId, timeout);
    };
  }, [handleNotesChange]);

  // Handle row click
  const handleRowClick = useCallback((row: CallRecord) => {
    onViewCall(row);
    logger.info('Call record selected for viewing', { callId: row.id });
  }, [onViewCall]);

  // Handle row double click
  const handleRowDoubleClick = useCallback((row: CallRecord) => {
    onViewCall(row);
    logger.info('Call record opened via double-click', { callId: row.id });
  }, [onViewCall]);

  // Handle open in pane
  const handleOpenInPane = useCallback((row: CallRecord) => {
    setSelectedCallForPane(row);
    setDetailPaneOpen(true);
    logger.info('Call record opened in pane', { callId: row.id });
  }, []);

  // Handle close pane
  const handleClosePane = useCallback(() => {
    setDetailPaneOpen(false);
    setSelectedCallForPane(null);
    logger.info('Call detail pane closed');
  }, []);

  // Handle open in new tab
  const handleOpenInNewTab = useCallback((row: CallRecord) => {
    // Open new browser tab with call detail
    const url = `${window.location.origin}${window.location.pathname}?context=new-tab&id=${row.id}`;
    window.open(url, '_blank');
    logger.info('Call record opened in new tab', { callId: row.id });
  }, []);



  // Define grid columns for our custom Grid
  const columns: GridColumn<CallRecord>[] = useMemo(() => [
    {
      key: 'dateOfCall',
      title: 'Date of Call',
      width: 170,
      priority: 1, // Essential - always visible
      sortable: true,
      filterable: true,
      type: 'date'
    },
    {
      key: 'timeOfCall',
      title: 'Time of Call',
      width: 150,
      priority: 2, // Important - visible on tablet+
      sortable: true,
      filterable: true,
      type: 'text'
    },
    {
      key: 'callLength',
      title: 'Call Length',
      width: 150,
      priority: 3, // Secondary - desktop only
      sortable: true,
      filterable: true,
      type: 'text'
    },
    {
      key: 'name',
      title: 'Name',
      width: 180,
      priority: 1, // Essential - always visible
      sortable: true,
      filterable: true,
      type: 'text'
    },
    {
      key: 'inboundOutbound',
      title: 'Inbound/Outbound',
      width: 210,
      priority: 2, // Important - visible on tablet+
      sortable: true,
      filterable: true,
      type: 'select',
      filterOptions: [
        { value: 'Inbound', label: 'Inbound' },
        { value: 'Outbound', label: 'Outbound' }
      ],
      renderer: ({ value }) => (
        <span className={getThemeClass(`call-direction call-direction--${value.toLowerCase()}`)}>
          <span className="icon" aria-hidden="true">{value === 'Inbound' ? '⬇️' : '⬆️'}</span>
          <span className="label">{value}</span>
        </span>
      )
    },
    {
      key: 'phoneNumber',
      title: 'Phone Number',
      width: 150,
      priority: 1, // Essential - always visible
      sortable: true,
      filterable: true,
      type: 'text'
    },
    {
      key: 'notes',
      title: 'Notes',
      width: 250,
      priority: 3, // Secondary - desktop only
      editable: true,
      type: 'text',
      renderer: ({ value, row }) => {
        // Use local notes state if available, otherwise use the record's notes
        const currentNotes = localNotes[row.id] !== undefined ? localNotes[row.id] : (value || '');

        return (
          <div className="notes-cell">
            <textarea
              value={currentNotes}
              onChange={(e) => {
                // Update local notes state immediately for responsive UI (row-specific)
                setLocalNotes(prev => ({
                  ...prev,
                  [row.id]: e.target.value
                }));
                // Trigger debounced save
                debouncedNotesChange(row.id, e.target.value);
              }}
              placeholder="Add notes..."
              className={getThemeClass('notes-textarea')}
              maxLength={255}
              rows={2}
            />
            {savingNotes.has(row.id) && (
              <div className="notes-saving-indicator">
                <span>Saving...</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 180,
      priority: 1, // Essential - always visible
      sortable: false,
      filterable: false,
      renderer: ({ row }) => (
        <div className="action-buttons-group">
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInPane(row);
            }}
            className={getThemeClass('action-icon action-icon--pane')}
            title="Open in collapsible pane"
            aria-label="Open in collapsible pane"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenInPane(row);
              }
            }}
          >
            ▤
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInNewTab(row);
            }}
            className={getThemeClass('action-icon action-icon--tab')}
            title="Open in new tab"
            aria-label="Open in new tab"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenInNewTab(row);
              }
            }}
          >
            ↗
          </span>
        </div>
      )
    }
  ], [getThemeClass, debouncedNotesChange, savingNotes, handleRowClick, handleOpenInPane, handleOpenInNewTab]);





  if (error) {
    return (
      <div className={getThemeClass('call-log-page call-log-page--error')}>
        <div className="error-message">
          <h3>Error Loading Call Records</h3>
          <p>{error}</p>
          <Button onClick={loadCallRecords} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={getThemeClass('call-log-page')}>
      {/* Header */}
      <div className="call-log-header">
        <h1 className={getThemeClass('call-log-title')}>Call Log</h1>
        <div className="call-log-actions">
          <span
            onClick={() => !loading && loadCallRecords()}
            className={`refresh-icon ${loading ? 'refresh-icon--loading' : ''}`}
            title={loading ? 'Loading...' : 'Refresh call records'}
            aria-label={loading ? 'Loading call records' : 'Refresh call records'}
            role="button"
            tabIndex={loading ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !loading) {
                e.preventDefault();
                loadCallRecords();
              }
            }}
          >
            🔄
          </span>
        </div>
      </div>

      {/* Custom Grid */}
      <div className="call-log-content">
        <Grid
          data={callRecords}
          columns={columns}
          theme="crm"
          loading={loading}
          height="100%"
          features={{
            selection: 'none',
            pagination: true,
            sorting: true,
            filtering: { columnFilters: true }
          }}
          // onRowDoubleClick={(row: CallRecord) => {
          //   handleRowDoubleClick(row);
          // }}
          className="call-log-grid"
          emptyComponent={
            <div className="no-records-message">
              No call records available.
            </div>
          }
          loadingComponent={
            <div className="grid-skeleton" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-cell w-24" />
                  <div className="skeleton-cell w-20" />
                  <div className="skeleton-cell w-16" />
                  <div className="skeleton-cell w-40" />
                  <div className="skeleton-cell w-24" />
                  <div className="skeleton-cell w-48" />
                  <div className="skeleton-cell w-28" />
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* Call Detail Pane */}
      <CallDetailPane
        isOpen={detailPaneOpen}
        callRecord={selectedCallForPane}
        onClose={handleClosePane}
      />
    </div>
  );
};

export default CallLogPage;
