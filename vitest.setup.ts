import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// expect.extend(matchers);

afterEach(() => {
  cleanup();
});
