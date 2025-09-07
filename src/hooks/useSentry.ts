import { useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
}

interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
}

interface SentryContext {
  [key: string]: any;
}

export const useSentry = () => {
  // Initialize Sentry
  const initializeSentry = useCallback((config: SentryConfig) => {
    try {
      Sentry.init({
        dsn: config.dsn || process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: config.environment || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
        release: config.release || process.env.NEXT_PUBLIC_SENTRY_RELEASE || '1.0.0',
        sampleRate: config.sampleRate || 1.0,
        tracesSampleRate: config.tracesSampleRate || 0.1,
        beforeSend(event) {
          // Filter out development errors in production
          if (process.env.NODE_ENV === 'production') {
            // Don't send console errors or development-specific errors
            if (event.exception?.values?.[0]?.value?.includes('Development')) {
              return null;
            }
          }
          return event;
        },
        integrations: [
          new Sentry.BrowserTracing({
            // Set sampling rate for performance monitoring
            tracePropagationTargets: [
              'localhost',
              /^https:\/\/teereserve\.golf/,
              /^https:\/\/api\.teereserve\.golf/,
            ],
          }),
        ],
      });
      
      logger.info('Sentry initialized successfully', {
        environment: config.environment,
        release: config.release,
      });
    } catch (error) {
      logger.error('Failed to initialize Sentry', { error });
    }
  }, []);

  // Set user context
  const setUser = useCallback((user: SentryUser) => {
    try {
      Sentry.setUser(user);
      logger.debug('Sentry user context set', { userId: user.id });
    } catch (error) {
      logger.error('Failed to set Sentry user context', { error });
    }
  }, []);

  // Set additional context
  const setContext = useCallback((key: string, context: SentryContext) => {
    try {
      Sentry.setContext(key, context);
      logger.debug('Sentry context set', { key });
    } catch (error) {
      logger.error('Failed to set Sentry context', { error, key });
    }
  }, []);

  // Add breadcrumb
  const addBreadcrumb = useCallback((message: string, category?: string, level?: Sentry.SeverityLevel, data?: any) => {
    try {
      Sentry.addBreadcrumb({
        message,
        category: category || 'custom',
        level: level || 'info',
        data,
        timestamp: Date.now() / 1000,
      });
    } catch (error) {
      logger.error('Failed to add Sentry breadcrumb', { error, message });
    }
  }, []);

  // Capture exception
  const captureException = useCallback((error: Error, context?: SentryContext) => {
    try {
      if (context) {
        Sentry.withScope((scope) => {
          Object.entries(context).forEach(([key, value]) => {
            scope.setContext(key, value);
          });
          Sentry.captureException(error);
        });
      } else {
        Sentry.captureException(error);
      }
      
      logger.error('Exception captured by Sentry', {
        error: error.message,
        stack: error.stack,
        context,
      });
    } catch (sentryError) {
      logger.error('Failed to capture exception in Sentry', { 
        originalError: error.message,
        sentryError,
      });
    }
  }, []);

  // Capture message
  const captureMessage = useCallback((message: string, level?: Sentry.SeverityLevel, context?: SentryContext) => {
    try {
      if (context) {
        Sentry.withScope((scope) => {
          Object.entries(context).forEach(([key, value]) => {
            scope.setContext(key, value);
          });
          Sentry.captureMessage(message, level || 'info');
        });
      } else {
        Sentry.captureMessage(message, level || 'info');
      }
      
      logger.info('Message captured by Sentry', { message, level, context });
    } catch (error) {
      logger.error('Failed to capture message in Sentry', { error, message });
    }
  }, []);

  // Start transaction for performance monitoring
  const startTransaction = useCallback((name: string, op?: string) => {
    try {
      const transaction = Sentry.startTransaction({
        name,
        op: op || 'navigation',
      });
      
      logger.debug('Sentry transaction started', { name, op });
      return transaction;
    } catch (error) {
      logger.error('Failed to start Sentry transaction', { error, name });
      return null;
    }
  }, []);

  // Set tag
  const setTag = useCallback((key: string, value: string) => {
    try {
      Sentry.setTag(key, value);
      logger.debug('Sentry tag set', { key, value });
    } catch (error) {
      logger.error('Failed to set Sentry tag', { error, key, value });
    }
  }, []);

  // Clear user context (for logout)
  const clearUser = useCallback(() => {
    try {
      Sentry.setUser(null);
      logger.debug('Sentry user context cleared');
    } catch (error) {
      logger.error('Failed to clear Sentry user context', { error });
    }
  }, []);

  // Auto-initialize Sentry on mount if DSN is available
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (dsn && dsn !== 'https://xxx@xxx.ingest.sentry.io/xxx') {
      initializeSentry({
        dsn,
        environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
        release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      });
    }
  }, [initializeSentry]);

  return {
    initializeSentry,
    setUser,
    setContext,
    addBreadcrumb,
    captureException,
    captureMessage,
    startTransaction,
    setTag,
    clearUser,
  };
};

// Higher-order component for automatic error boundary integration
export const withSentryErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  const DefaultFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
    return React.createElement('div', {
      className: 'flex flex-col items-center justify-center min-h-[200px] p-6 text-center'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold text-red-600 mb-2'
      }, 'Something went wrong'),
      React.createElement('p', {
        key: 'message',
        className: 'text-gray-600 mb-4'
      }, error.message),
      React.createElement('button', {
        key: 'button',
        onClick: resetError,
        className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
      }, 'Try again')
    ]);
  };

  return Sentry.withErrorBoundary(Component, {
    fallback: fallback || DefaultFallback,
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
      logger.error('Error boundary captured error', {
        error: error.message,
        stack: error.stack,
        errorInfo,
      });
    },
  });
};

export default useSentry;