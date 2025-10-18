import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@shared/services/theme';
import CallLogPage from '../CallLogPage';
import { MockCallRecordsAPI, CallRecord } from '../../services/mockDataService';

// Mock the API service
jest.mock('../../services/mockDataService', () => ({
  ...jest.requireActual('../../services/mockDataService'),
  MockCallRecordsAPI: {
    getInstance: jest.fn(),
  },
}));

const mockCallRecords: CallRecord[] = [
  {
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
    transcript: 'Customer called about billing issue...',
    summary: 'Billing issue resolved.',
    notes: '',
    createdAt: '2025-08-10T08:41:00Z',
    updatedAt: '2025-08-10T08:41:00Z',
  },
  {
    id: 'call-2',
    dateOfCall: '2025-08-09',
    timeOfCall: '09:44',
    callLength: '00:15:36',
    name: 'Nina King',
    inboundOutbound: 'Outbound',
    phoneNumber: '+44 7911 116042',
    callId: 'CALL-DEF456',
    callType: 'Sales Inquiry',
    userName: 'Agent Johnson',
    callDirection: 'Outbound',
    transcript: 'Sales call about enterprise features...',
    summary: 'Sales opportunity identified.',
    notes: 'Follow up next week',
    createdAt: '2025-08-09T09:44:00Z',
    updatedAt: '2025-08-09T09:44:00Z',
  },
];

const mockApiService = {
  getCallRecords: jest.fn(),
  updateCallRecord: jest.fn(),
  searchCallRecords: jest.fn(),
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider defaultTheme="crm" enableAutoDetection={false}>
    {children}
  </ThemeProvider>
);

describe('CallLogPage Component', () => {
  const user = userEvent.setup();
  const mockOnViewCall = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (MockCallRecordsAPI.getInstance as jest.Mock).mockReturnValue(mockApiService);
    
    mockApiService.getCallRecords.mockResolvedValue({
      records: mockCallRecords,
      total: mockCallRecords.length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
    
    mockApiService.updateCallRecord.mockResolvedValue(mockCallRecords[0]);
    mockApiService.searchCallRecords.mockResolvedValue(mockCallRecords);
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Call Log')).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Mike Harris')).toBeInTheDocument();
      });
    });

    it('displays loading state initially', () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('displays call records after loading', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Mike Harris')).toBeInTheDocument();
        expect(screen.getByText('Nina King')).toBeInTheDocument();
        expect(screen.getByText('+44 7911 114808')).toBeInTheDocument();
        expect(screen.getByText('Inbound')).toBeInTheDocument();
      });
    });
  });

  describe('Data Grid Functionality', () => {
    it('displays all required columns', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Date of Call')).toBeInTheDocument();
        expect(screen.getByText('Time of Call')).toBeInTheDocument();
        expect(screen.getByText('Call Length')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Inbound/Outbound')).toBeInTheDocument();
        expect(screen.getByText('Phone Number')).toBeInTheDocument();
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
      });
    });

    it('handles row click to view call details', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const viewButton = screen.getAllByText('View')[0];
        fireEvent.click(viewButton);
        expect(mockOnViewCall).toHaveBeenCalledWith(mockCallRecords[0]);
      });
    });

    it('displays call direction indicators correctly', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const inboundElement = screen.getByText('Inbound');
        const outboundElement = screen.getByText('Outbound');
        
        expect(inboundElement).toHaveClass('call-direction--inbound');
        expect(outboundElement).toHaveClass('call-direction--outbound');
      });
    });
  });

  describe('Notes Functionality', () => {
    it('allows editing notes in the grid', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const notesTextareas = screen.getAllByPlaceholderText('Add notes...');
        expect(notesTextareas).toHaveLength(mockCallRecords.length);
      });
    });

    it('auto-saves notes after typing', async () => {
      jest.useFakeTimers();

      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );

      await waitFor(() => {
        const notesTextarea = screen.getAllByPlaceholderText('Add notes...')[0];
        fireEvent.change(notesTextarea, { target: { value: 'Test note' } });

        // Fast-forward time to trigger debounced save
        jest.advanceTimersByTime(1100);
      });

      await waitFor(() => {
        expect(mockApiService.updateCallRecord).toHaveBeenCalledWith(
          mockCallRecords[0].id,
          { notes: 'Test note' }
        );
      });

      jest.useRealTimers();
    });

    it('shows saving indicator when notes are being saved', async () => {
      // Mock a delayed API response
      mockApiService.updateCallRecord.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockCallRecords[0]), 100))
      );
      
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const notesTextarea = screen.getAllByPlaceholderText('Add notes...')[0];
        fireEvent.change(notesTextarea, { target: { value: 'Test note' } });
      });
      
      // The saving indicator should appear briefly
      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('displays search input and buttons', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      expect(screen.getByPlaceholderText('Search name...')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('performs search when search button is clicked', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search name...');
      const searchButton = screen.getByText('Search');
      
      await user.type(searchInput, 'Mike');
      await user.click(searchButton);
      
      expect(mockApiService.searchCallRecords).toHaveBeenCalledWith('Mike');
    });

    it('performs search when Enter key is pressed', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search name...');
      
      await user.type(searchInput, 'Mike');
      await user.keyboard('{Enter}');
      
      expect(mockApiService.searchCallRecords).toHaveBeenCalledWith('Mike');
    });

    it('shows clear button when search query exists', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search name...');
      await user.type(searchInput, 'Mike');
      
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search name...');
      await user.type(searchInput, 'Mike');
      
      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Pagination', () => {
    it('displays pagination info', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Showing \d+ to \d+ of \d+ records/)).toBeInTheDocument();
      });
    });

    it('handles pagination when multiple pages exist', async () => {
      // Mock response with multiple pages
      mockApiService.getCallRecords.mockResolvedValue({
        records: mockCallRecords,
        total: 50,
        page: 1,
        pageSize: 20,
        totalPages: 3,
      });
      
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', async () => {
      mockApiService.getCallRecords.mockRejectedValue(new Error('API Error'));
      
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Error Loading Call Records')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      mockApiService.getCallRecords
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          records: mockCallRecords,
          total: mockCallRecords.length,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        });
      
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        fireEvent.click(retryButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Mike Harris')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies theme classes correctly', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      const pageContainer = screen.getByText('Call Log').closest('.call-log-page');
      expect(pageContainer).toHaveClass('call-log-page');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      expect(screen.getByRole('heading', { name: 'Call Log' })).toBeInTheDocument();
    });

    it('has accessible form controls', async () => {
      render(
        <TestWrapper>
          <CallLogPage onViewCall={mockOnViewCall} />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search name...');
      expect(searchInput).toHaveAttribute('type', 'text');
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
