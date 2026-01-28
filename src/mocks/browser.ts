/**
 * Mock Service Worker browser setup
 * This is a stub for development without MSW
 */

export default async function startMockServiceWorker(): Promise<void> {
  console.log('Mock Service Worker is disabled. Using PocketBase backend directly.');
  return Promise.resolve();
}
