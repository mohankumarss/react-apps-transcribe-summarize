import React from 'react';
import { Button } from '@shared/components';
import './SummaryPanel.css';

interface Transcript {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  duration: number;
  summary?: string;
}

export interface SummaryPanelProps {
  transcript: Transcript;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ transcript }) => {
  return (
    <div className="summary-panel">
      <h3 className="summary-panel__title">
        Summary & Insights
      </h3>

      {/* Summary Section */}
      <div className="summary-section">
        <h4 className="summary-section__title">
          AI Summary
        </h4>

        <div className="summary-content">
          {transcript.summary ? (
            <p className="summary-text">
              {transcript.summary}
            </p>
          ) : (
            <p className="summary-placeholder">
              No summary available. Click "Generate Summary" to create one.
            </p>
          )}
        </div>
      </div>

      {/* Key Points Section */}
      <div className="summary-section">
        <h4 className="summary-section__title">
          Key Points
        </h4>

        <div className="summary-content">
          <ul className="insights-list">
            <li className="insight-item">
              <span className="insight-text">Customer inquiry about billing</span>
            </li>
            <li className="insight-item">
              <span className="insight-text">Payment method updated</span>
            </li>
            <li className="insight-item">
              <span className="insight-text">Issue resolved successfully</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Items Section */}
      <div className="summary-section">
        <h4 className="summary-section__title">
          Action Items
        </h4>

        <div className="summary-content">
          <ul className="insights-list">
            <li className="insight-item">
              <input type="checkbox" />
              <span className="insight-text">Follow up with customer in 24 hours</span>
            </li>
            <li className="insight-item">
              <input type="checkbox" />
              <span className="insight-text">Update customer record</span>
            </li>
            <li className="insight-item">
              <input type="checkbox" />
              <span className="insight-text">Send confirmation email</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="summary-section">
        <h4 className="summary-section__title">
          Sentiment Analysis
        </h4>

        <div className="summary-content">
          <div className="insight-item">
            <div className="insight-icon" style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--theme-success, #10b981)',
              borderRadius: '50%'
            }}></div>
            <span className="insight-text">
              Positive (85%)
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions-section">
        <div className="actions-grid">
          <Button size="small" className="action-button">
            Export Summary
          </Button>
          <Button variant="secondary" size="small" className="action-button">
            Add to CRM
          </Button>
          <Button variant="secondary" size="small" className="action-button">
            Schedule Follow-up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
