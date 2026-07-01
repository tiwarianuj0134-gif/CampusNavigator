/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log to error reporting service (e.g., Sentry)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#060612] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Something went wrong
            </h1>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Please try refreshing the page or return to the homepage.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-left overflow-auto">
                <p className="text-sm font-mono text-red-600 dark:text-red-400">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} icon={<RefreshCw size={16} />}>
                Try Again
              </Button>
              <Button variant="secondary" onClick={this.handleGoHome} icon={<Home size={16} />}>
                Go Home
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Offline Detection Component
 */
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff size={16} />
        <span>You're offline. Some features may be unavailable.</span>
      </div>
    </motion.div>
  );
}

export default ErrorBoundary;
