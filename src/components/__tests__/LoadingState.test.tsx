import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render loading spinner', () => {
    const { container } = render(<LoadingState language="en" />);
    expect(container.querySelector('.spinner-circle')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<LoadingState language="en" message="Custom loading message" />);
    expect(screen.getByText(/Custom loading message/)).toBeInTheDocument();
  });

  it('should render default message when no message provided', () => {
    render(<LoadingState language="en" size="medium" />);
    // Should render a default message based on size
    expect(screen.getByText(/Processing|Loading/i)).toBeInTheDocument();
  });

  it('should render progress bar when showProgressBar is true', () => {
    const { container } = render(
      <LoadingState language="en" showProgressBar progress={50} />
    );
    expect(container.querySelector('.progress-bar')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should update progress bar width based on progress value', () => {
    const { container } = render(
      <LoadingState language="en" showProgressBar progress={75} />
    );
    const progressFill = container.querySelector('.progress-fill') as HTMLElement;
    expect(progressFill).toHaveStyle({ width: '75%' });
  });

  it('should clamp progress value between 0 and 100', () => {
    const { container, rerender } = render(
      <LoadingState language="en" showProgressBar progress={150} />
    );
    let progressFill = container.querySelector('.progress-fill') as HTMLElement;
    expect(progressFill).toHaveStyle({ width: '100%' });

    rerender(<LoadingState language="en" showProgressBar progress={-10} />);
    progressFill = container.querySelector('.progress-fill') as HTMLElement;
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  it('should render steps when provided', () => {
    const steps = ['Step 1', 'Step 2', 'Step 3'];
    render(<LoadingState language="en" steps={steps} currentStep={1} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('should mark completed steps correctly', () => {
    const steps = ['Step 1', 'Step 2', 'Step 3'];
    const { container } = render(
      <LoadingState language="en" steps={steps} currentStep={1} />
    );
    const stepItems = container.querySelectorAll('.step-item');
    expect(stepItems[0]).toHaveClass('completed');
    expect(stepItems[1]).toHaveClass('active');
    expect(stepItems[2]).toHaveClass('pending');
  });

  it('should render cancel button when onCancel is provided', () => {
    const onCancel = vi.fn();
    render(<LoadingState language="en" onCancel={onCancel} />);
    const cancelButton = screen.getByText(/Cancel/i);
    expect(cancelButton).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<LoadingState language="en" onCancel={onCancel} />);
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should show estimated time when provided', () => {
    render(<LoadingState language="en" estimatedTime="2 minutes" />);
    expect(screen.getByText(/2 minutes/)).toBeInTheDocument();
  });

  it('should animate dots', async () => {
    render(<LoadingState language="en" message="Loading" />);
    const initialText = screen.getByText(/Loading/);
    
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(initialText.textContent).toMatch(/Loading\./);
    });

    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(initialText.textContent).toMatch(/Loading\.\./);
    });
  });

  it('should track elapsed time', async () => {
    render(<LoadingState language="en" />);
    
    vi.advanceTimersByTime(5000);
    await waitFor(() => {
      expect(screen.getByText(/5s/)).toBeInTheDocument();
    });
  });

  it('should format elapsed time correctly', async () => {
    render(<LoadingState language="en" />);
    
    vi.advanceTimersByTime(65000); // 1 minute 5 seconds
    await waitFor(() => {
      expect(screen.getByText(/1m 5s/)).toBeInTheDocument();
    });
  });

  it('should render in fullscreen mode', () => {
    const { container } = render(<LoadingState language="en" fullScreen />);
    expect(container.querySelector('.loading-fullscreen')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { container, rerender } = render(
      <LoadingState language="en" size="small" />
    );
    expect(container.querySelector('.loading-small')).toBeInTheDocument();

    rerender(<LoadingState language="en" size="large" />);
    expect(container.querySelector('.loading-large')).toBeInTheDocument();
  });

  it('should render in Turkish', () => {
    render(<LoadingState language="tr" />);
    // Turkish translations should be present
    expect(screen.getByText(/İşleniyor|Yükleniyor/i)).toBeInTheDocument();
  });

  it('should cleanup timers on unmount', () => {
    const { unmount } = render(<LoadingState language="en" />);
    unmount();
    // Verify no memory leaks by checking that timers are cleared
    expect(vi.getTimerCount()).toBe(0);
  });
});
