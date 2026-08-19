import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = "We couldn't complete your request. Please try again.",
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-6 sm:p-8 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-center space-y-4 max-w-md mx-auto animate-in fade-in ${className}`}
      role="alert"
    >
      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-red-900 dark:text-red-200 font-['Outfit']">
          {title}
        </h4>
        <p className="text-xs text-red-700 dark:text-red-300/80 leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2 flex justify-center">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
