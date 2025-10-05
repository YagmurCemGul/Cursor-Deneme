import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay - Enhanced Features', () => {
  it('should show common solutions for network errors', () => {
    const error = new Error('Network connection failed');
    render(<ErrorDisplay error={error} language="en" showCommonSolutions />);
    
    expect(screen.getByText(/Possible Solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/internet connection/i)).toBeInTheDocument();
  });

  it('should show common solutions for rate limit errors', () => {
    const error = new Error('Rate limit exceeded');
    render(<ErrorDisplay error={error} language="en" showCommonSolutions />);
    
    expect(screen.getByText(/Possible Solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/Wait a few minutes/i)).toBeInTheDocument();
  });

  it('should show common solutions for validation errors', () => {
    const error = new Error('Validation failed: Invalid input');
    render(<ErrorDisplay error={error} language="en" showCommonSolutions />);
    
    expect(screen.getByText(/Possible Solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/Check your input data/i)).toBeInTheDocument();
  });

  it('should not show solutions when showCommonSolutions is false', () => {
    const error = new Error('Network connection failed');
    render(<ErrorDisplay error={error} language="en" showCommonSolutions={false} />);
    
    expect(screen.queryByText(/Possible Solutions/i)).not.toBeInTheDocument();
  });

  it('should render recovery actions', () => {
    const action1 = vi.fn();
    const action2 = vi.fn();
    const recoveryActions = [
      { label: 'Retry', action: action1, icon: '🔄', primary: true },
      { label: 'Cancel', action: action2, icon: '✕', primary: false },
    ];
    
    render(
      <ErrorDisplay
        error="Test error"
        language="en"
        recoveryActions={recoveryActions}
      />
    );
    
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call recovery action when clicked', () => {
    const action = vi.fn();
    const recoveryActions = [
      { label: 'Custom Action', action, primary: true },
    ];
    
    render(
      <ErrorDisplay
        error="Test error"
        language="en"
        recoveryActions={recoveryActions}
      />
    );
    
    const actionButton = screen.getByText('Custom Action');
    fireEvent.click(actionButton);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should show both retry button and recovery actions', () => {
    const onRetry = vi.fn();
    const recoveryActions = [
      { label: 'Custom Action', action: vi.fn(), primary: false },
    ];
    
    render(
      <ErrorDisplay
        error="Test error"
        language="en"
        onRetry={onRetry}
        recoveryActions={recoveryActions}
      />
    );
    
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('should apply primary styles to primary recovery actions', () => {
    const recoveryActions = [
      { label: 'Primary', action: vi.fn(), primary: true },
      { label: 'Secondary', action: vi.fn(), primary: false },
    ];
    
    const { container } = render(
      <ErrorDisplay
        error="Test error"
        language="en"
        recoveryActions={recoveryActions}
      />
    );
    
    const primaryButton = screen.getByText('Primary');
    const secondaryButton = screen.getByText('Secondary');
    
    expect(primaryButton.className).toContain('btn-primary');
    expect(secondaryButton.className).toContain('btn-secondary');
  });

  it('should show icons with recovery actions', () => {
    const recoveryActions = [
      { label: 'Action', action: vi.fn(), icon: '🔧', primary: true },
    ];
    
    render(
      <ErrorDisplay
        error="Test error"
        language="en"
        recoveryActions={recoveryActions}
      />
    );
    
    const actionButton = screen.getByText((content, element) => {
      return element?.textContent === '🔧 Action';
    });
    expect(actionButton).toBeInTheDocument();
  });

  it('should detect AI configuration errors', () => {
    const error = new Error('AI provider not configured');
    render(<ErrorDisplay error={error} language="en" />);
    
    expect(screen.getByText(/configure your AI provider/i)).toBeInTheDocument();
  });

  it('should detect API key errors', () => {
    const error = new Error('Invalid API key provided');
    render(<ErrorDisplay error={error} language="en" />);
    
    expect(screen.getByText(/configure your AI provider/i)).toBeInTheDocument();
  });

  it('should render with warning variant', () => {
    const { container } = render(
      <ErrorDisplay error="Warning message" language="en" variant="warning" />
    );
    
    expect(container.querySelector('.error-warning')).toBeInTheDocument();
  });

  it('should render with info variant', () => {
    const { container } = render(
      <ErrorDisplay error="Info message" language="en" variant="info" />
    );
    
    expect(container.querySelector('.error-info')).toBeInTheDocument();
  });

  it('should handle string errors', () => {
    render(<ErrorDisplay error="Simple error string" language="en" />);
    expect(screen.getByText('Simple error string')).toBeInTheDocument();
  });

  it('should handle Error objects', () => {
    const error = new Error('Error object message');
    render(<ErrorDisplay error={error} language="en" />);
    expect(screen.getByText('Error object message')).toBeInTheDocument();
  });

  it('should not show multiple solution types at once', () => {
    const error = new Error('Network error with timeout');
    render(<ErrorDisplay error={error} language="en" showCommonSolutions />);
    
    // Should only show network error solutions, not timeout-specific ones
    const solutions = screen.getAllByRole('listitem').length;
    expect(solutions).toBeLessThanOrEqual(3); // Typically 3 solutions per category
  });
});
