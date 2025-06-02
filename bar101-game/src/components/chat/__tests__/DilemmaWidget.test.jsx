import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DilemmaWidget from '../DilemmaWidget';

describe('DilemmaWidget Component', () => {
  const defaultProps = {
    dilemmaTitleA: 'Option A Title',
    dilemmaTitleB: 'Option B Title',
    buttonLabelA: 'Choose A',
    buttonLabelB: 'Choose B',
    dilemmaPreference: 0.7,
    onButtonAClick: jest.fn(),
    onButtonBClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<DilemmaWidget {...defaultProps} />);
    
    expect(screen.getByText('Choose A')).toBeInTheDocument();
    expect(screen.getByText('Choose B')).toBeInTheDocument();
  });

  test('renders with required props', () => {
    const requiredProps = {
      dilemmaTitleA: 'Title A',
      dilemmaTitleB: 'Title B',
      buttonLabelA: 'Button A',
      buttonLabelB: 'Button B',
      dilemmaPreference: 0.5,
    };

    render(<DilemmaWidget {...requiredProps} />);
    
    expect(screen.getByText('Button A')).toBeInTheDocument();
    expect(screen.getByText('Button B')).toBeInTheDocument();
  });

  test('displays title A when preference > 0.5', () => {
    render(<DilemmaWidget {...defaultProps} dilemmaPreference={0.8} />);
    
    expect(screen.getByText('DECISION WILL LEADS TO:')).toBeInTheDocument();
    expect(screen.getByText('Option A Title')).toBeInTheDocument();
    expect(screen.queryByText('Option B Title')).not.toBeInTheDocument();
  });

  test('displays title B when preference <= 0.5', () => {
    render(<DilemmaWidget {...defaultProps} dilemmaPreference={0.3} />);
    
    expect(screen.getByText('DECISION WILL LEAD TO:')).toBeInTheDocument();
    expect(screen.getByText('Option B Title')).toBeInTheDocument();
    expect(screen.queryByText('Option A Title')).not.toBeInTheDocument();
  });

  test('displays title B when preference exactly 0.5', () => {
    render(<DilemmaWidget {...defaultProps} dilemmaPreference={0.5} />);
    
    expect(screen.getByText('DECISION WILL LEAD TO:')).toBeInTheDocument();
    expect(screen.getByText('Option B Title')).toBeInTheDocument();
    expect(screen.queryByText('Option A Title')).not.toBeInTheDocument();
  });

  test('renders progress bar with correct width', () => {
    const { container } = render(<DilemmaWidget {...defaultProps} dilemmaPreference={0.7} />);
    
    const progressBar = container.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle('width: 70%');
    expect(progressBar).toHaveAttribute('aria-valuenow', '70');
  });

  test('renders progress bar with 0% width', () => {
    const { container } = render(<DilemmaWidget {...defaultProps} dilemmaPreference={0} />);
    
    const progressBar = container.querySelector('.progress-bar');
    expect(progressBar).toHaveStyle('width: 0%');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  test('renders progress bar with 100% width', () => {
    const { container } = render(<DilemmaWidget {...defaultProps} dilemmaPreference={1} />);
    
    const progressBar = container.querySelector('.progress-bar');
    expect(progressBar).toHaveStyle('width: 100%');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  test('calls onButtonAClick when button A is clicked', async () => {
    const onButtonAClick = jest.fn();
    const user = userEvent.setup();
    
    render(<DilemmaWidget {...defaultProps} onButtonAClick={onButtonAClick} />);
    
    const buttonA = screen.getByText('Choose A');
    await user.click(buttonA);
    
    expect(onButtonAClick).toHaveBeenCalledTimes(1);
  });

  test('calls onButtonBClick when button B is clicked', async () => {
    const onButtonBClick = jest.fn();
    const user = userEvent.setup();
    
    render(<DilemmaWidget {...defaultProps} onButtonBClick={onButtonBClick} />);
    
    const buttonB = screen.getByText('Choose B');
    await user.click(buttonB);
    
    expect(onButtonBClick).toHaveBeenCalledTimes(1);
  });

  test('buttons are enabled by default', () => {
    render(<DilemmaWidget {...defaultProps} />);
    
    const buttonA = screen.getByText('Choose A');
    const buttonB = screen.getByText('Choose B');
    
    expect(buttonA).not.toBeDisabled();
    expect(buttonB).not.toBeDisabled();
  });

  test('buttons are enabled when enabled prop is true', () => {
    render(<DilemmaWidget {...defaultProps} enabled={true} />);
    
    const buttonA = screen.getByText('Choose A');
    const buttonB = screen.getByText('Choose B');
    
    expect(buttonA).not.toBeDisabled();
    expect(buttonB).not.toBeDisabled();
  });

  test('buttons are disabled when enabled prop is false', () => {
    render(<DilemmaWidget {...defaultProps} enabled={false} />);
    
    const buttonA = screen.getByText('Choose A');
    const buttonB = screen.getByText('Choose B');
    
    expect(buttonA).toBeDisabled();
    expect(buttonB).toBeDisabled();
  });

  test('disabled buttons do not trigger click handlers', async () => {
    const onButtonAClick = jest.fn();
    const onButtonBClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <DilemmaWidget 
        {...defaultProps} 
        enabled={false}
        onButtonAClick={onButtonAClick}
        onButtonBClick={onButtonBClick}
      />
    );
    
    const buttonA = screen.getByText('Choose A');
    const buttonB = screen.getByText('Choose B');
    
    await user.click(buttonA);
    await user.click(buttonB);
    
    expect(onButtonAClick).not.toHaveBeenCalled();
    expect(onButtonBClick).not.toHaveBeenCalled();
  });

  test('renders FontAwesome icons in buttons', () => {
    const { container } = render(<DilemmaWidget {...defaultProps} />);
    
    // FontAwesome icons are rendered as SVG elements
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(2); // One icon per button
  });

  test('progress bar has correct accessibility attributes', () => {
    const { container } = render(<DilemmaWidget {...defaultProps} dilemmaPreference={0.6} />);
    
    const progressBar = container.querySelector('.progress-bar');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  test('component structure includes all expected elements', () => {
    const { container } = render(<DilemmaWidget {...defaultProps} />);
    
    // Check that main elements exist without relying on CSS module classes
    const progressElement = container.querySelector('.progress');
    const progressBar = container.querySelector('.progress-bar');
    const buttons = container.querySelectorAll('button');
    
    expect(progressElement).toBeInTheDocument();
    expect(progressBar).toBeInTheDocument();
    expect(buttons).toHaveLength(2);
  });

  test('handles extreme preference values correctly', () => {
    // Test with very small preference
    const { rerender, container } = render(
      <DilemmaWidget {...defaultProps} dilemmaPreference={0.001} />
    );
    
    let progressBar = container.querySelector('.progress-bar');
    expect(progressBar).toHaveStyle('width: 0.1%');
    
    // Test with preference very close to 1
    rerender(<DilemmaWidget {...defaultProps} dilemmaPreference={0.999} />);
    
    progressBar = container.querySelector('.progress-bar');
    expect(progressBar).toHaveStyle('width: 99.9%');
  });

  test('component handles prop changes correctly', () => {
    const { rerender } = render(<DilemmaWidget {...defaultProps} dilemmaPreference={0.3} />);
    
    expect(screen.getByText('Option B Title')).toBeInTheDocument();
    
    // Change preference to show option A
    rerender(<DilemmaWidget {...defaultProps} dilemmaPreference={0.8} />);
    
    expect(screen.getByText('Option A Title')).toBeInTheDocument();
    expect(screen.queryByText('Option B Title')).not.toBeInTheDocument();
  });

  test('component with minimal props (no click handlers)', () => {
    const minimalProps = {
      dilemmaTitleA: 'Option A',
      dilemmaTitleB: 'Option B',
      buttonLabelA: 'Button A',
      buttonLabelB: 'Button B',
      dilemmaPreference: 0.5,
    };

    expect(() => render(<DilemmaWidget {...minimalProps} />)).not.toThrow();
  });

  test('default click handlers do not throw when buttons are clicked', async () => {
    const minimalProps = {
      dilemmaTitleA: 'Title A',
      dilemmaTitleB: 'Title B',
      buttonLabelA: 'Click A',
      buttonLabelB: 'Click B',
      dilemmaPreference: 0.5,
    };

    const user = userEvent.setup();
    render(<DilemmaWidget {...minimalProps} />);
    
    const buttonA = screen.getByRole('button', { name: /Click A/i });
    const buttonB = screen.getByRole('button', { name: /Click B/i });
    
    // Should not throw with default handlers
    await expect(user.click(buttonA)).resolves.not.toThrow();
    await expect(user.click(buttonB)).resolves.not.toThrow();
  });

  test('component handles long text content', () => {
    const longTextProps = {
      ...defaultProps,
      dilemmaTitleA: 'This is a very long title for option A that might wrap to multiple lines',
      dilemmaTitleB: 'This is a very long title for option B that might also wrap to multiple lines',
      buttonLabelA: 'Very Long Button Label A',
      buttonLabelB: 'Very Long Button Label B',
    };

    expect(() => render(<DilemmaWidget {...longTextProps} />)).not.toThrow();
    expect(screen.getByText('Very Long Button Label A')).toBeInTheDocument();
    expect(screen.getByText('Very Long Button Label B')).toBeInTheDocument();
  });

  test('component renders with edge case preference values', () => {
    // Test exactly at threshold
    const { rerender } = render(<DilemmaWidget {...defaultProps} dilemmaPreference={0.50001} />);
    expect(screen.getByText('Option A Title')).toBeInTheDocument();

    // Test just below threshold
    rerender(<DilemmaWidget {...defaultProps} dilemmaPreference={0.49999} />);
    expect(screen.getByText('Option B Title')).toBeInTheDocument();
  });
}); 