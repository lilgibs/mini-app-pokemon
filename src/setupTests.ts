import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest does not tear the DOM down between tests on its own. Without this,
// components from the previous test are still mounted and queries like
// getByRole find two of the same element.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
