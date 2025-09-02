import * as Sentry from '@sentry/react';

// Initialize Sentry
export const initErrorMonitoring = (dsn?: string) => {
  if (!dsn) {
    console.warn('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      // Performance monitoring
      Sentry.browserTracingIntegration(),
      // Capture console logs
      Sentry.captureConsoleIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/your-site-name\.com/],
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log('Sentry error monitoring initialized');
};

// Error logging utility
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error, context);

  if (Sentry.isInitialized()) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setTag(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  }
};

// Performance tracking
export const trackPerformance = (name: string, startTime?: number) => {
  if (!Sentry.isInitialized()) return;

  const endTime = performance.now();
  const duration = startTime ? endTime - startTime : endTime;

  Sentry.withScope((scope) => {
    scope.setTag('performance', 'true');
    Sentry.captureMessage(`${name}: ${duration.toFixed(2)}ms`, 'info');
  });
};
