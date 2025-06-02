import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatInput from '../ChatInput';

describe('ChatInput Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<ChatInput />);
    
    const chatInputDiv = container.firstChild;
    expect(chatInputDiv).toBeInTheDocument();
    expect(chatInputDiv.tagName.toLowerCase()).toBe('div');
  });

  test('renders children when provided', () => {
    const testText = 'Test input content';
    render(
      <ChatInput>
        <span>{testText}</span>
      </ChatInput>
    );
    
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  test('renders multiple children correctly', () => {
    render(
      <ChatInput>
        <input placeholder="Type message..." />
        <button>Send</button>
      </ChatInput>
    );
    
    const input = screen.getByPlaceholderText('Type message...');
    const button = screen.getByRole('button');
    
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  test('renders as a div element', () => {
    const { container } = render(
      <ChatInput>
        <span>Test content</span>
      </ChatInput>
    );
    
    const chatInputDiv = container.firstChild;
    expect(chatInputDiv.tagName.toLowerCase()).toBe('div');
  });

  test('renders without children (null case)', () => {
    const { container } = render(<ChatInput />);
    
    const chatInputDiv = container.firstChild;
    expect(chatInputDiv).toBeEmptyDOMElement();
  });

  test('handles complex nested children', () => {
    render(
      <ChatInput>
        <div>
          <input type="text" placeholder="Enter message" />
          <div>
            <button type="button">Send</button>
            <button type="button">Cancel</button>
          </div>
        </div>
      </ChatInput>
    );
    
    expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('maintains accessibility structure', () => {
    render(
      <ChatInput>
        <label htmlFor="chat-input">Message:</label>
        <input id="chat-input" type="text" />
      </ChatInput>
    );
    
    const input = screen.getByLabelText('Message:');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'chat-input');
  });

  test('renders with text content as children', () => {
    const textContent = 'Plain text content';
    render(<ChatInput>{textContent}</ChatInput>);
    
    expect(screen.getByText(textContent)).toBeInTheDocument();
  });

  test('component structure is correct', () => {
    const { container } = render(
      <ChatInput>
        <span data-testid="test-child">Child element</span>
      </ChatInput>
    );
    
    const chatInputDiv = container.firstChild;
    const childElement = screen.getByTestId('test-child');
    
    expect(chatInputDiv.tagName.toLowerCase()).toBe('div');
    expect(chatInputDiv).toContainElement(childElement);
  });

  test('passes through all children prop types correctly', () => {
    // Test with various React node types
    render(
      <ChatInput>
        <span>Text node</span>
        {123}
        {null}
        {false}
        <div>
          <p>Nested element</p>
        </div>
      </ChatInput>
    );
    
    expect(screen.getByText('Text node')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Nested element')).toBeInTheDocument();
  });

  test('renders with defaultProps when no children provided', () => {
    const { container } = render(<ChatInput />);
    
    const chatInputDiv = container.firstChild;
    expect(chatInputDiv).toBeInTheDocument();
    expect(chatInputDiv.children).toHaveLength(0);
  });

  test('component props validation works correctly', () => {
    // This test ensures the component accepts the expected prop types
    const validChildren = [
      <span key="1">Text</span>,
      <div key="2">More content</div>
    ];
    
    expect(() => render(<ChatInput>{validChildren}</ChatInput>)).not.toThrow();
  });

  test('handles single child element', () => {
    render(
      <ChatInput>
        <input type="text" placeholder="Single input" />
      </ChatInput>
    );
    
    expect(screen.getByPlaceholderText('Single input')).toBeInTheDocument();
  });

  test('handles string children', () => {
    const stringChild = 'Simple string child';
    render(<ChatInput>{stringChild}</ChatInput>);
    
    expect(screen.getByText(stringChild)).toBeInTheDocument();
  });

  test('handles number children', () => {
    const numberChild = 42;
    render(<ChatInput>{numberChild}</ChatInput>);
    
    expect(screen.getByText('42')).toBeInTheDocument();
  });
}); 