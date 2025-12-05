import { afterEach, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { config } from 'dotenv';

config({ path: '.env.test', override: true });

expect.extend(matchers);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
