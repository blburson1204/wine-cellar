'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentDidCatch(error: Error, errorInfo: any): void {
    // Log error to console in development
    console.error('React error boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // In production, you would send this to an error tracking service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or other error tracking service
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#C73E3A',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                marginBottom: '16px',
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: '24px',
                marginBottom: '12px',
                color: '#4A1C26',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#7C2D3C',
                marginBottom: '24px',
              }}
            >
              We apologize for the inconvenience. The error has been logged and we'll look into it.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              style={{
                padding: '10px 20px',
                backgroundColor: '#7C2D3C',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
