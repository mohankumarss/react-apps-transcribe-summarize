import React, { useState } from 'react';
import { Button, LoadingSpinner } from '@shared/components';
import { formatDate } from '@shared/utils';

interface Transcript {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  duration: number;
  summary?: string;
}

interface TranscriptViewerProps {
  transcript: Transcript;
  onGenerateSummary: (transcriptId: string) => Promise<void>;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ 
  transcript, 
  onGenerateSummary 
}) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      await onGenerateSummary(transcript.id);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      padding: '2rem',
      backgroundColor: '#fff',
      borderRight: '1px solid #e5e7eb'
    }}>
      {/* Transcript Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
          {transcript.title}
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          fontSize: '0.875rem', 
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          <span>Created: {formatDate(transcript.createdAt, 'MMM dd, yyyy h:mm a')}</span>
          <span>Duration: {Math.floor(transcript.duration / 60)}m {transcript.duration % 60}s</span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            size="small"
          >
            {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
          </Button>
          <Button variant="secondary" size="small">
            Export
          </Button>
          <Button variant="secondary" size="small">
            Share
          </Button>
        </div>
      </div>

      {/* Transcript Content */}
      <div style={{ 
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        minHeight: '400px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Transcript</h3>
        
        {isGeneratingSummary && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#dbeafe',
            borderRadius: '0.375rem'
          }}>
            <LoadingSpinner size="small" />
            <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              Generating AI summary...
            </span>
          </div>
        )}
        
        <div style={{ 
          lineHeight: '1.6',
          color: '#374151',
          whiteSpace: 'pre-wrap'
        }}>
          {transcript.content}
        </div>
      </div>

      {/* Transcript Actions */}
      <div style={{ 
        marginTop: '1rem',
        display: 'flex',
        gap: '0.5rem',
        fontSize: '0.875rem'
      }}>
        <Button variant="secondary" size="small">
          Search in Transcript
        </Button>
        <Button variant="secondary" size="small">
          Add Timestamp
        </Button>
        <Button variant="secondary" size="small">
          Highlight Text
        </Button>
      </div>
    </div>
  );
};

export default TranscriptViewer;
