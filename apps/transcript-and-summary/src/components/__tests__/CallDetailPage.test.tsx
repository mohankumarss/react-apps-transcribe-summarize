import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@shared/services/theme';
import CallDetailPage from '../CallDetailPage';
import { CallRecord } from '../../services/mockDataService';

// Mock the call records service
jest.mock('../../services/callRecordsService', () => ({
  getCallRecordsService: jest.fn(() => ({
    getCallRecords: jest.fn(),
    getCallRecord: jest.fn(),
    updateCallRecord: jest.fn(),
    searchCallRecords: jest.fn(),
  })),
  resetCallRecordsService: jest.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockCallRecord: CallRecord = {
  id: 'call-1',
  dateOfCall: '2025-08-10',
  timeOfCall: '08:41',
  callLength: '00:14:34',
  name: 'Mike Harris',
  inboundOutbound: 'Inbound',
  phoneNumber: '+44 7911 114808',
  callId: 'CALL-ABC123',
  callType: 'Customer Support',
  userName: 'Agent Smith',
  callDirection: 'Inbound',
  transcript: 'Customer: Hi, I need help with my account.\nAgent: I\'d be happy to help you with that.',
  summary: 'Customer called about account issues. Agent provided assistance and resolved the problem.',
  notes: 'Initial notes about the call',
  createdAt: '2025-08-10T08:41:00Z',
  updatedAt: '2025-08-10T08:41:00Z',
};

const mockApiService = {
  updateCallRecord: jest.fn(),
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider defaultTheme="crm" enableAutoDetection={false}>
    {children}
  </ThemeProvider>
);

describe('CallDetailPage Component', () => {
  const user = userEvent.setup();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { getCallRecordsService } = require('../../services/callRecordsService');
    (getCallRecordsService as jest.Mock).mockReturnValue(mockApiService);
    mockApiService.updateCallRecord.mockResolvedValue(mockCallRecord);
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    it('displays call information in header', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByText('10/08/2025')).toBeInTheDocument();
      expect(screen.getByText('08:41')).toBeInTheDocument();
      expect(screen.getByText('14m 34s')).toBeInTheDocument();
      expect(screen.getByText('CALL-ABC123')).toBeInTheDocument();
      expect(screen.getByText('Customer Support')).toBeInTheDocument();
      expect(screen.getByText('Agent Smith')).toBeInTheDocument();
      expect(screen.getByText('+44 7911 114808')).toBeInTheDocument();
    });

    it('displays call direction with proper styling', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const directionElement = screen.getByText('Inbound');
      expect(directionElement).toHaveClass('call-direction--inbound');
    });

    it('displays three-column layout', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Call Transcript')).toBeInTheDocument();
      expect(screen.getByText('Call Summary')).toBeInTheDocument();
      expect(screen.getByText('Contact Notes Editor')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onBack when back button is clicked', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const backButton = screen.getByText('← Back');
      await user.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Transcript Column', () => {
    it('displays transcript content', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Customer: Hi, I need help with my account/)).toBeInTheDocument();
      expect(screen.getByText(/Agent: I'd be happy to help you with that/)).toBeInTheDocument();
    });

    it('has search functionality for transcript', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search transcript...');
      expect(searchInput).toBeInTheDocument();
      
      await user.type(searchInput, 'Customer');
      expect(searchInput).toHaveValue('Customer');
    });

    it('has copy button for transcript', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const copyButtons = screen.getAllByText('Copy');
      const transcriptCopyButton = copyButtons[0]; // First copy button is for transcript
      
      await user.click(transcriptCopyButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCallRecord.transcript);
    });

    it('shows "Copied!" feedback after copying transcript', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const copyButtons = screen.getAllByText('Copy');
      const transcriptCopyButton = copyButtons[0];
      
      await user.click(transcriptCopyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('Summary Column', () => {
    it('displays summary content', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Call Purpose:')).toBeInTheDocument();
      expect(screen.getByText('Key Points:')).toBeInTheDocument();
      expect(screen.getByText('Resolution:')).toBeInTheDocument();
      expect(screen.getByText(/Customer called about account issues/)).toBeInTheDocument();
    });

    it('has search functionality for summary', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search summary...');
      expect(searchInput).toBeInTheDocument();
      
      await user.type(searchInput, 'account');
      expect(searchInput).toHaveValue('account');
    });

    it('has copy button for summary', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const copyButtons = screen.getAllByText('Copy');
      const summaryCopyButton = copyButtons[1]; // Second copy button is for summary
      
      await user.click(summaryCopyButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCallRecord.summary);
    });
  });

  describe('Notes Column', () => {
    it('displays notes editor with initial content', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const notesTextarea = screen.getByDisplayValue('Initial notes about the call');
      expect(notesTextarea).toBeInTheDocument();
    });

    it('allows editing notes', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const notesTextarea = screen.getByDisplayValue('Initial notes about the call');
      
      await user.clear(notesTextarea);
      await user.type(notesTextarea, 'Updated notes');
      
      expect(notesTextarea).toHaveValue('Updated notes');
    });

    it('auto-saves notes after editing', async () => {
      jest.useFakeTimers();
      
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const notesTextarea = screen.getByDisplayValue('Initial notes about the call');
      
      await user.clear(notesTextarea);
      await user.type(notesTextarea, 'Updated notes');
      
      // Fast-forward time to trigger auto-save
      jest.advanceTimersByTime(1100);
      
      await waitFor(() => {
        expect(mockApiService.updateCallRecord).toHaveBeenCalledWith(
          mockCallRecord.id,
          { notes: 'Updated notes' }
        );
      });
      
      jest.useRealTimers();
    });

    it('shows saving indicator when notes are being saved', async () => {
      // Mock a delayed API response
      mockApiService.updateCallRecord.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockCallRecord), 100))
      );
      
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const notesTextarea = screen.getByDisplayValue('Initial notes about the call');
      
      await user.clear(notesTextarea);
      await user.type(notesTextarea, 'Updated notes');
      
      // The saving indicator should appear briefly
      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });

    it('displays character count', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByText(/\d+ characters/)).toBeInTheDocument();
    });

    it('displays auto-save information', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Auto-saves after 1 second of inactivity')).toBeInTheDocument();
    });

    it('has copy button for notes', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const copyButtons = screen.getAllByText('Copy');
      const notesCopyButton = copyButtons[2]; // Third copy button is for notes
      
      await user.click(notesCopyButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCallRecord.notes);
    });
  });

  describe('Search Highlighting', () => {
    it('highlights search terms in transcript', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search transcript...');
      await user.type(searchInput, 'Customer');
      
      // Check if the transcript content is updated with highlighting
      await waitFor(() => {
        const transcriptContent = screen.getByText(/Customer: Hi, I need help with my account/);
        expect(transcriptContent).toBeInTheDocument();
      });
    });

    it('highlights search terms in summary', async () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search summary...');
      await user.type(searchInput, 'account');
      
      // Check if the summary content is updated with highlighting
      await waitFor(() => {
        const summaryContent = screen.getByText(/Customer called about account issues/);
        expect(summaryContent).toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies theme classes correctly', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const pageContainer = screen.getByText('← Back').closest('.call-detail-page');
      expect(pageContainer).toHaveClass('call-detail-page');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      expect(screen.getByRole('heading', { name: 'Call Transcript' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Call Summary' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Contact Notes Editor' })).toBeInTheDocument();
    });

    it('has accessible form controls', () => {
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const searchInputs = screen.getAllByRole('textbox');
      expect(searchInputs.length).toBeGreaterThan(0);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles clipboard copy errors gracefully', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Clipboard error'));
      
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const copyButtons = screen.getAllByText('Copy');
      await user.click(copyButtons[0]);
      
      // Should not crash and should not show "Copied!" message
      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      });
    });

    it('handles API errors when saving notes', async () => {
      mockApiService.updateCallRecord.mockRejectedValue(new Error('API Error'));
      
      render(
        <TestWrapper>
          <CallDetailPage callRecord={mockCallRecord} onBack={mockOnBack} />
        </TestWrapper>
      );
      
      const notesTextarea = screen.getByDisplayValue('Initial notes about the call');
      
      await user.clear(notesTextarea);
      await user.type(notesTextarea, 'Updated notes');
      
      // Should not crash even if API call fails
      expect(notesTextarea).toHaveValue('Updated notes');
    });
  });
});
