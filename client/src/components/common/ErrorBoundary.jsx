import React from 'react';
import { Button } from './Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isDev = Boolean(import.meta.env?.DEV || (typeof window !== 'undefined' && window.location.hostname === 'localhost'));

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Something went wrong
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                We couldn't load this workspace view. You can try refreshing the page or returning to the dashboard.
              </p>
            </div>

            {(isDev || this.state.showDetails) && this.state.error && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-left font-mono text-[11px] text-rose-500 overflow-x-auto border border-slate-200 dark:border-slate-800 max-h-40">
                <p className="font-bold mb-1">{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-500 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
            )}

            {!isDev && !this.state.showDetails && (
              <button
                type="button"
                onClick={() => this.setState({ showDetails: true })}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
              >
                Show Diagnostic Details
              </button>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={this.handleReset}
                className="text-xs"
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Home}
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="text-xs"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
