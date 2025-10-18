import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../App';
import { MockCallRecordsAPI } from '../services/mockDataService';

// Mock the shared services
jest.mock('@shared/services', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@shared/utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the call records service
jest.mock('../services/callRecordsService', () => ({
  getCallRecordsService: jest.fn(() => ({
    getCallRecords: jest.fn(),
    getCallRecord: jest.fn(),
    updateCallRecord: jest.fn(),
    searchCallRecords: jest.fn(),
  })),
  resetCallRecordsService: jest.fn(),
}));

const mockCallRecords = [
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
];

const mockApiService = {
  getCallRecords: jest.fn(),
  updateCallRecord: jest.fn(),
  searchCallRecords: jest.fn(),
};

describe('App Component', () => {
  const user = userEvent.setup();

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
  });

  describe('Authentication Flow', () => {
    it('shows login screen when user is not authenticated', () => {
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
      });

      render(<App />);
      
      expect(screen.getByText('Transcript and Summary')).toBeInTheDocument();
      expect(screen.getByText('Please log in to access the application.')).toBeInTheDocument();
      expect(screen.getByText('Demo Login')).toBeInTheDocument();
    });

    it('calls login function when demo login button is clicked', async () => {
      const mockLogin = jest.fn();
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: mockLogin,
      });

      render(<App />);
      
      const loginButton = screen.getByText('Demo Login');
      await user.click(loginButton);
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'demo@example.com',
        password: 'password',
      });
    });

    it('shows main app when user is authenticated', async () => {
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: { name: 'Test User' },
        isAuthenticated: true,
        login: jest.fn(),
      });

      render(<App />);
      
      // Should show the call log page
      await waitFor(() => {
        expect(screen.getByText('Call Log')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Flow', () => {
    beforeEach(() => {
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: { name: 'Test User' },
        isAuthenticated: true,
        login: jest.fn(),
      });
    });

    it('starts with call log page view', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Call Log')).toBeInTheDocument();
      });
    });

    it('navigates to call detail page when view button is clicked', async () => {
      render(<App />);
      
      // Wait for call log to load
      await waitFor(() => {
        expect(screen.getByText('Mike Harris')).toBeInTheDocument();
      });
      
      // Click view button
      const viewButton = screen.getByText('View');
      await user.click(viewButton);
      
      // Should navigate to detail page
      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeInTheDocument();
        expect(screen.getByText('Call Transcript')).toBeInTheDocument();
        expect(screen.getByText('Call Summary')).toBeInTheDocument();
        expect(screen.getByText('Contact Notes Editor')).toBeInTheDocument();
      });
    });

    it('navigates back to call log when back button is clicked', async () => {
      render(<App />);
      
      // Wait for call log to load and navigate to detail
      await waitFor(() => {
        expect(screen.getByText('Mike Harris')).toBeInTheDocument();
      });
      
      const viewButton = screen.getByText('View');
      await user.click(viewButton);
      
      // Wait for detail page to load
      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeInTheDocument();
      });
      
      // Click back button
      const backButton = screen.getByText('← Back');
      await user.click(backButton);
      
      // Should navigate back to call log
      await waitFor(() => {
        expect(screen.getByText('Call Log')).toBeInTheDocument();
        expect(screen.queryByText('← Back')).not.toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    beforeEach(() => {
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: { name: 'Test User' },
        isAuthenticated: true,
        login: jest.fn(),
      });
    });

    it('wraps app content with ThemeProvider', () => {
      render(<App />);
      
      // The app should be wrapped with ThemeProvider
      // This is tested indirectly by checking if theme-aware components render correctly
      const appContainer = screen.getByTestId('app-container');
      expect(appContainer).toBeInTheDocument();
    });

    it('applies theme classes to app container', async () => {
      render(<App />);
      
      const appContainer = screen.getByTestId('app-container');
      expect(appContainer).toHaveClass('transcript-app');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: { name: 'Test User' },
        isAuthenticated: true,
        login: jest.fn(),
      });
    });

    it('handles API errors gracefully', async () => {
      mockApiService.getCallRecords.mockRejectedValue(new Error('API Error'));
      
      render(<App />);
      
      // Should show error state instead of crashing
      await waitFor(() => {
        expect(screen.getByText('Error Loading Call Records')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: { name: 'Test User' },
        isAuthenticated: true,
        login: jest.fn(),
      });
    });

    it('maintains selected call record state during navigation', async () => {
      render(<App />);
      
      // Navigate to detail page
      await waitFor(() => {
        expect(screen.getByText('Mike Harris')).toBeInTheDocument();
      });
      
      const viewButton = screen.getByText('View');
      await user.click(viewButton);
      
      // Verify call record data is displayed in detail page
      await waitFor(() => {
        expect(screen.getByText('CALL-ABC123')).toBeInTheDocument();
        expect(screen.getByText('Customer Support')).toBeInTheDocument();
        expect(screen.getByText('Agent Smith')).toBeInTheDocument();
      });
    });

    it('clears selected call record when navigating back', async () => {
      render(<App />);
      
      // Navigate to detail page and back
      await waitFor(() => {
        expect(screen.getByText('Mike Harris')).toBeInTheDocument();
      });
      
      const viewButton = screen.getByText('View');
      await user.click(viewButton);
      
      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeInTheDocument();
      });
      
      const backButton = screen.getByText('← Back');
      await user.click(backButton);
      
      // Should be back to list view
      await waitFor(() => {
        expect(screen.getByText('Call Log')).toBeInTheDocument();
        expect(screen.queryByText('Call Transcript')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      const { useAuth } = require('@shared/services');
      useAuth.mockReturnValue({
        user: { name: 'Test User' },
        isAuthenticated: true,
        login: jest.fn(),
      });
    });

    it('has proper test IDs for testing', async () => {
      render(<App />);
      
      expect(screen.getByTestId('app-container')).toBeInTheDocument();
    });

    it('maintains focus management during navigation', async () => {
      render(<App />);
      
      // This is a basic test - in a real app you'd test focus management more thoroughly
      await waitFor(() => {
        expect(screen.getByText('Call Log')).toBeInTheDocument();
      });
      
      // The app should be accessible and not have any obvious accessibility issues
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
