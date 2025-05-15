import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { createLogger } from 'winston';
import * as logger from './logger.service'; // import _after_ mocking

vi.mock('winston', () => ({
  createLogger: vi.fn(() => ({
    log: vi.fn(),
  })),
  format: { combine: vi.fn(), timestamp: vi.fn(), json: vi.fn() },
  transports: { Console: vi.fn() },
}));

const mockLog = (createLogger as Mock).mock.results[0]?.value.log;

describe('logger helpers', () => {
  it.each`
    fn           | level
    ${'debug'}   | ${'debug'}
    ${'info'}    | ${'info'}
    ${'warning'} | ${'warn'}
    ${'error'}   | ${'error'}
  `('$fn forwards to winston with level=$level', ({ fn, level }) => {
    mockLog.mockClear();
    (logger as any)[fn]('hello');

    expect(mockLog).toHaveBeenCalledWith({ level, message: 'hello' });
  });
});
