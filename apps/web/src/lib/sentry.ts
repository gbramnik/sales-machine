import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking
 * Must be called before React app initialization
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN_FRONTEND;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 
                      import.meta.env.MODE || 
                      'development';

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    // Performance Monitoring (basic)
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
  });

  console.log(`✅ Sentry initialized for environment: ${environment}`);
}

/**
 * Set user context for Sentry from auth state
 */
export function setSentryUser(userId: string, email: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

