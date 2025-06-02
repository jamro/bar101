import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatSubmitButton from '../ChatSubmitButton';

describe('ChatSubmitButton Component', () => {
  test('renders with default props', () => {
    render(<ChatSubmitButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Send');
  });

  test('renders with custom label', () => {
    render(<ChatSubmitButton label="Submit Message" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Submit Message');
  });

  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatSubmitButton onClick={handleClick} label="Test" />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders FontAwesome icon', () => {
    render(<ChatSubmitButton />);
    
    // FontAwesome icons render as svg elements
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  test('has correct button type', () => {
    render(<ChatSubmitButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  test('handles multiple clicks correctly', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatSubmitButton onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  test('button is accessible', () => {
    render(<ChatSubmitButton label="Send Message" />);
    
    const button = screen.getByRole('button');
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });

  test('works without onClick handler', async () => {
    const user = userEvent.setup();
    
    // Should not throw when no onClick is provided
    render(<ChatSubmitButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // If we get here without throwing, the test passes
    expect(button).toBeInTheDocument();
  });
}); 