import React from 'react';
import { render, screen } from '@testing-library/react';
import { Grid } from '../Grid';
import { GridColumn } from '../types';

// Mock the responsive hook to avoid window/ResizeObserver issues in tests
jest.mock('../hooks/useResponsive', () => ({
  useResponsiveGrid: () => ({
    currentBreakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1200,
    containerWidth: 1200,
    visibleColumns: [
      { key: 'id', title: 'ID', width: 80 },
      { key: 'name', title: 'Name', width: 200 },
      { key: 'email', title: 'Email', width: 250 }
    ],
    responsiveConfig: new Map(),
    shouldStack: false,
    shouldCompact: false
  })
}));

// Mock theme service
jest.mock('../../services/theme', () => ({
  useThemeStyles: () => ({
    getThemeClass: (className: string) => className
  })
}));

describe('Grid Responsive Functionality', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  const mockColumns: GridColumn[] = [
    { key: 'id', title: 'ID', width: 80 },
    { key: 'name', title: 'Name', width: 200 },
    { key: 'email', title: 'Email', width: 250 }
  ];

  it('renders Grid component without crashing', () => {
    render(
      <Grid
        data={mockData}
        columns={mockColumns}
        features={{ selection: 'none', pagination: false }}
      />
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays column headers', () => {
    render(
      <Grid
        data={mockData}
        columns={mockColumns}
        features={{ selection: 'none', pagination: false }}
      />
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('displays data rows', () => {
    render(
      <Grid
        data={mockData}
        columns={mockColumns}
        features={{ selection: 'none', pagination: false }}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('applies responsive CSS classes', () => {
    const { container } = render(
      <Grid
        data={mockData}
        columns={mockColumns}
        features={{ selection: 'none', pagination: false }}
      />
    );

    const gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass('grid--desktop');
  });

  it('handles empty data gracefully', () => {
    render(
      <Grid
        data={[]}
        columns={mockColumns}
        features={{ selection: 'none', pagination: false }}
      />
    );

    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('maintains backward compatibility with existing column width props', () => {
    const columnsWithPixelWidths: GridColumn[] = [
      { key: 'id', title: 'ID', width: 80 },
      { key: 'name', title: 'Name', width: 200 },
      { key: 'email', title: 'Email', width: 250 }
    ];

    render(
      <Grid
        data={mockData}
        columns={columnsWithPixelWidths}
        features={{ selection: 'none', pagination: false }}
      />
    );

    // Should render without errors
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
