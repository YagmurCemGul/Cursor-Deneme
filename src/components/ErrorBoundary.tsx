import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('React Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Track error for frequency analysis
    import('../utils/errorTracking').then(({ ErrorTrackingService }) => {
      ErrorTrackingService.trackError(error, 'React Component', {
        componentStack: errorInfo.componentStack,
      }).catch(() => {
        // Silently fail to avoid infinite loops
      });
    }).catch(() => {
      // Silently fail if error tracking is not available
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            margin: '10px',
          }}
        >
          <h2 style={{ color: '#c00', margin: '0 0 10px 0' }}>⚠️ Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Error Details</summary>
            <div style={{ marginTop: '10px' }}>
              <strong>Error:</strong>
              <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
                {this.state.error?.toString()}
              </pre>
              {this.state.errorInfo && (
                <>
                  <strong>Component Stack:</strong>
                  <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
