// Test setup file for Vitest
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom';

// Extend Vitest's expect method with testing-library matchers
expect.extend(matchers);

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});