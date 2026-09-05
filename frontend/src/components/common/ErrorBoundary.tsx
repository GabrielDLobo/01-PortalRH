import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={`min-h-[300px] flex items-center justify-center p-6 ${this.props.className || ''}`}>
          <div className="text-center max-w-md mx-auto animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-danger-100 rounded-full">
                <ExclamationTriangleIcon className="h-8 w-8 text-danger-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Oops! Something went wrong
            </h3>
            
            <p className="text-neutral-600 mb-6">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                icon={<ArrowPathIcon className="h-4 w-4" />}
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600 font-mono overflow-auto max-h-32">
                  <div className="font-semibold text-danger-600 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <div>
                    {this.state.error.stack}
                  </div>
                  {this.state.errorInfo && (
                    <div className="mt-2 pt-2 border-t border-neutral-200">
                      <div className="font-semibold mb-1">Component Stack:</div>
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;