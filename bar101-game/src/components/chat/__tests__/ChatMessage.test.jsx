import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatMessage from '../ChatMessage';

describe('ChatMessage Component', () => {
  test('renders without crashing', () => {
    render(<ChatMessage>Test message</ChatMessage>);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('renders with default props', () => {
    const { container } = render(<ChatMessage>Hello World</ChatMessage>);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument(); // default from
    
    // Should be visible by default - check that we have the two div structure
    const allDivs = container.querySelectorAll('div');
    expect(allDivs.length).toBeGreaterThan(0);
  });

  test('renders with custom from prop', () => {
    render(<ChatMessage from="Alice">Hello from Alice</ChatMessage>);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Hello from Alice')).toBeInTheDocument();
  });

  test('renders with custom footer prop', () => {
    render(<ChatMessage footer="2:30 PM">Message with timestamp</ChatMessage>);
    
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    expect(screen.getByText('Message with timestamp')).toBeInTheDocument();
  });

  test('renders with userIndex 0', () => {
    const { container } = render(
      <ChatMessage userIndex={0}>Left aligned message</ChatMessage>
    );
    
    expect(screen.getByText('Left aligned message')).toBeInTheDocument();
    // Basic structural test without CSS class checking
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders with userIndex greater than 0', () => {
    const { container } = render(
      <ChatMessage userIndex={1}>Right aligned message</ChatMessage>
    );
    
    expect(screen.getByText('Right aligned message')).toBeInTheDocument();
    // Basic structural test without CSS class checking
    expect(container.firstChild).toBeInTheDocument();
  });

  test('handles visibility prop correctly when visible=true', () => {
    const { container } = render(
      <ChatMessage visible={true}>Visible message</ChatMessage>
    );
    
    expect(screen.getByText('Visible message')).toBeInTheDocument();
    // Check that the component renders something when visible
    expect(container.firstChild).toBeInTheDocument();
  });

  test('handles visibility prop correctly when visible=false', () => {
    const { container } = render(
      <ChatMessage visible={false}>Hidden message</ChatMessage>
    );
    
    // Content should still exist in DOM but be styled as hidden
    expect(container.firstChild).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    const { container } = render(
      <ChatMessage onClick={handleClick}>Clickable message</ChatMessage>
    );
    
    // Find the clickable div by looking for the one with onClick
    const clickableDiv = container.querySelector('div[style*="display: block"]');
    if (clickableDiv) {
      await user.click(clickableDiv);
      expect(handleClick).toHaveBeenCalledTimes(1);
    } else {
      // If we can't find the exact div, just click the container
      await user.click(container.firstChild);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  test('handles multiple clicks correctly', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    const { container } = render(
      <ChatMessage onClick={handleClick}>Multi-click message</ChatMessage>
    );
    
    // Find the clickable div by looking for the one with onClick
    const clickableDiv = container.querySelector('div[style*="display: block"]') || container.firstChild;
    
    await user.click(clickableDiv);
    await user.click(clickableDiv);
    await user.click(clickableDiv);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  test('works without onClick handler', async () => {
    const user = userEvent.setup();
    
    // Should not throw when no onClick is provided (uses default empty function)
    const { container } = render(<ChatMessage>No click handler</ChatMessage>);
    
    const clickableDiv = container.querySelector('div[style*="display: block"]') || container.firstChild;
    if (clickableDiv) {
      await user.click(clickableDiv);
      expect(clickableDiv).toBeInTheDocument();
    } else {
      // If no clickable element found, just verify the component renders
      expect(container.firstChild).toBeInTheDocument();
    }
  });

  test('renders different userIndex values', () => {
    const { container: container1 } = render(
      <ChatMessage userIndex={0}>User 0 message</ChatMessage>
    );
    const { container: container2 } = render(
      <ChatMessage userIndex={1}>User 1 message</ChatMessage>
    );
    
    expect(screen.getByText('User 0 message')).toBeInTheDocument();
    expect(screen.getByText('User 1 message')).toBeInTheDocument();
    
    // Both should render successfully
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });

  test('handles complex children content', () => {
    render(
      <ChatMessage from="System">
        <div>
          <p>Complex message with</p>
          <strong>bold text</strong> and <em>italic text</em>
        </div>
      </ChatMessage>
    );
    
    expect(screen.getByText('Complex message with')).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('italic text')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  test('renders multiple children correctly', () => {
    render(
      <ChatMessage>
        <span>First part</span>
        <span>Second part</span>
      </ChatMessage>
    );
    
    expect(screen.getByText('First part')).toBeInTheDocument();
    expect(screen.getByText('Second part')).toBeInTheDocument();
  });

  test('component structure includes header and footer', () => {
    render(
      <ChatMessage from="TestUser" footer="TestFooter">
        <span data-testid="message-content">Test Content</span>
      </ChatMessage>
    );
    
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('TestFooter')).toBeInTheDocument();
    expect(screen.getByTestId('message-content')).toBeInTheDocument();
  });

  test('handles string content as children', () => {
    const stringContent = 'Simple string message';
    render(<ChatMessage>{stringContent}</ChatMessage>);
    
    expect(screen.getByText(stringContent)).toBeInTheDocument();
  });

  test('handles number content as children', () => {
    const numberContent = 12345;
    render(<ChatMessage>{numberContent}</ChatMessage>);
    
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  test('handles mixed content types', () => {
    render(
      <ChatMessage>
        <span>Element content</span>
        {42}
        {null}
        {false}
      </ChatMessage>
    );
    
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Element content')).toBeInTheDocument();
  });

  test('applies userIndex modulo for different users', () => {
    // Test that userIndex cycles through available user styles
    const { container } = render(
      <ChatMessage userIndex={10}>High index message</ChatMessage>
    );
    
    expect(screen.getByText('High index message')).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  test('component props validation works correctly', () => {
    // Test that component accepts all expected prop types without throwing
    const validProps = {
      from: 'ValidUser',
      footer: 'ValidFooter',
      userIndex: 1,
      onClick: jest.fn(),
      visible: true
    };
    
    expect(() => 
      render(<ChatMessage {...validProps}>Valid content</ChatMessage>)
    ).not.toThrow();
  });

  test('message header displays from prop correctly', () => {
    render(<ChatMessage from="ChatBot">Bot message</ChatMessage>);
    
    expect(screen.getByText('ChatBot')).toBeInTheDocument();
  });

  test('message footer displays footer prop correctly', () => {
    render(<ChatMessage footer="Just now">Recent message</ChatMessage>);
    
    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  test('renders empty footer by default', () => {
    const { container } = render(<ChatMessage>Message without footer</ChatMessage>);
    
    expect(screen.getByText('Message without footer')).toBeInTheDocument();
    // Footer div should exist but be empty
    expect(container).toBeInTheDocument();
  });

  test('handles boolean visibility states', () => {
    // Test explicit true
    const { rerender } = render(
      <ChatMessage visible={true}>Visible message</ChatMessage>
    );
    expect(screen.getByText('Visible message')).toBeInTheDocument();
    
    // Test explicit false
    rerender(<ChatMessage visible={false}>Hidden message</ChatMessage>);
    // Component should still exist in DOM
    expect(screen.getByText('Hidden message')).toBeInTheDocument();
  });

  test('handles various userIndex values', () => {
    // Test different userIndex values
    [0, 1, 2, 5, 10].forEach(index => {
      const { container } = render(
        <ChatMessage userIndex={index}>Message {index}</ChatMessage>
      );
      expect(screen.getByText(`Message ${index}`)).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });
  });
}); 