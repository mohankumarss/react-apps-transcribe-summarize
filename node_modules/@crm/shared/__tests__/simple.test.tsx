/**
 * Simple Tests
 * 
 * Basic tests to verify Jest setup is working
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const SimpleComponent: React.FC<{ message?: string }> = ({ message = 'Hello World' }) => {
  return (
    <div data-testid="simple-component">
      <h1>{message}</h1>
    </div>
  );
};

describe('Simple Tests', () => {
  test('renders simple component', () => {
    render(<SimpleComponent />);
    
    const component = screen.getByTestId('simple-component');
    const heading = screen.getByText('Hello World');
    
    expect(component).toBeTruthy();
    expect(heading).toBeTruthy();
  });

  test('renders component with custom message', () => {
    render(<SimpleComponent message="Custom Message" />);
    
    const component = screen.getByTestId('simple-component');
    const heading = screen.getByText('Custom Message');
    
    expect(component).toBeTruthy();
    expect(heading).toBeTruthy();
  });

  test('basic JavaScript functionality', () => {
    const sum = 2 + 2;
    const message = 'test';
    
    expect(sum).toBe(4);
    expect(message).toBe('test');
    expect(typeof message).toBe('string');
  });
});
