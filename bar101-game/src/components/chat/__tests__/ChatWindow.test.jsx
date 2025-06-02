import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from '../ChatWindow';

// Simple integration test approach - test the component as a whole
describe('ChatWindow Component', () => {
  test('renders without crashing with minimal props', () => {
    const { container } = render(<ChatWindow />);
    
    // Check that the component renders something
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders with options and onSubmit', () => {
    const onSubmit = jest.fn();
    const options = ['Option 1', 'Option 2'];
    
    const { container } = render(
      <ChatWindow options={options} onSubmit={onSubmit} />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders with custom children', () => {
    render(
      <ChatWindow>
        <div data-testid="custom-content">Custom Content</div>
      </ChatWindow>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  test('renders with input header', () => {
    render(
      <ChatWindow 
        inputHeader="Test Header"
        options={['Option 1']}
      />
    );
    
    expect(screen.getByText('Test Header')).toBeInTheDocument();
  });

  test('component accepts all expected props without throwing', () => {
    const props = {
      options: ['Test Option'],
      onSubmit: jest.fn(),
      children: React.createElement('div', {}, 'Test Child'),
      inputHeader: 'Test Header'
    };
    
    expect(() => render(<ChatWindow {...props} />)).not.toThrow();
  });

  test('component has proper forwardRef structure', () => {
    const ref = React.createRef();
    
    render(<ChatWindow ref={ref} />);
    
    // Component should render and ref should be set
    expect(ref.current).not.toBeNull();
  });

  test('default props work correctly', () => {
    // Should not throw with no props
    expect(() => render(<ChatWindow />)).not.toThrow();
  });

  test('handles empty options array', () => {
    expect(() => 
      render(<ChatWindow options={[]} onSubmit={jest.fn()} />)
    ).not.toThrow();
  });

  test('component structure is stable', () => {
    const { container, rerender } = render(<ChatWindow />);
    const initialHTML = container.innerHTML;
    
    // Re-render with same props
    rerender(<ChatWindow />);
    
    // Structure should remain the same
    expect(container.innerHTML).toBe(initialHTML);
  });

  test('component handles prop changes', () => {
    const { rerender } = render(
      <ChatWindow options={['Initial']} />
    );
    
    // Should not throw when props change
    expect(() => 
      rerender(<ChatWindow options={['Updated']} />)
    ).not.toThrow();
  });
}); 