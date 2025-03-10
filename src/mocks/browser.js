/**
 * Mock Service Worker Browser Setup
 * 
 * This file configures MSW for the browser environment, defining handlers
 * for intercepting and mocking API requests during development.
 * 
 * @see https://mswjs.io/docs/
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create and export the service worker
export const worker = setupWorker(...handlers);

// Initialize the worker
export const startMockServiceWorker = () => {
  if (import.meta.env.VITE_USE_MEMORY_DB === 'true') {
    worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    }).catch(console.error);
    
    console.log('%c[MSW] Mock Service Worker activated', 'color: green; font-weight: bold;');
  } else {
    console.log('%c[MSW] Mock Service Worker disabled - using real services', 'color: orange;');
  }
};

export default startMockServiceWorker; 