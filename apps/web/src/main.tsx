// Initialize Sentry BEFORE React app initialization
import { initSentry } from './lib/sentry';
initSentry();

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { App } from './App';
import './index.css';

// Create ErrorBoundary component
const SentryErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>We've been notified and are working on a fix.</p>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  ),
  beforeCapture: (scope, _error, errorInfo) => {
    if (errorInfo && typeof errorInfo === 'object' && 'componentStack' in errorInfo) {
      scope.setContext('react', {
        componentStack: String(errorInfo.componentStack),
      });
    }
  },
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary />
  </React.StrictMode>,
);
