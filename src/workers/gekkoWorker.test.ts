import { spawn } from 'bun';
import { rm, writeFile } from 'fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('fs/promises', () => ({
  rm: vi.fn(async () => undefined),
  writeFile: vi.fn(async () => undefined),
}));

vi.mock('bun', () => ({
  spawn: vi.fn(),
}));

let onmessage: (event: MessageEvent<unknown>) => Promise<void>;
let postMessage: Mock;
let exitMock: unknown;

beforeEach(async () => {
  postMessage = vi.fn();
  (globalThis as unknown as { postMessage: Mock; self: Worker }).postMessage = postMessage;
  (globalThis as unknown as { postMessage: Mock; self: Worker }).self = {} as unknown as Worker;
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  await import('./gekkoWorker');
  onmessage = (globalThis as unknown as { self: Worker }).self.onmessage as unknown as (
    event: MessageEvent<unknown>,
  ) => Promise<void>;
});

afterEach(() => {
  vi.resetModules();
  delete (globalThis as { [key: string]: unknown }).self;
  delete (globalThis as { [key: string]: unknown }).postMessage;
});

describe('gekkoWorker', () => {
  it('should spawn gekko and reports usage', async () => {
    const usage = { maxRSS: 1000, cpuTime: { user: 10, system: 2 } };
    const proc = {
      exited: Promise.resolve(0),
      resourceUsage: vi.fn(() => usage),
      killed: false,
      kill: vi.fn(),
    };
    (spawn as Mock).mockReturnValue(proc);

    const event = {
      data: { workerId: 1, configuration: 'cfg', gekkoConfigFolderPath: '/tmp', gekkoExec: '/gekko' },
    } as MessageEvent;
    await onmessage(event);

    expect(rm).toHaveBeenCalledWith('/tmp/config-1.yml', { force: true });
    expect(writeFile).toHaveBeenCalledWith('/tmp/config-1.yml', 'cfg', 'utf-8');

    const call = (spawn as Mock).mock.calls[0]![0];
    expect(call.cmd).toEqual(['/gekko']);
    expect(call.env.GEKKO_LOG_LEVEL).toBe('error');
    expect(call.env.GEKKO_CONFIG_FILE_PATH).toBe('/tmp/config-1.yml');
    expect(call.stdout).toBe('inherit');

    expect(postMessage).toHaveBeenCalledWith(expect.stringContaining('Gekko worker n°1 done'));
    expect(proc.kill).toHaveBeenCalledWith('SIGTERM');
    expect(exitMock as Mock).toHaveBeenCalled();
  });

  it('should report errors', async () => {
    (spawn as Mock).mockImplementation(() => {
      throw new Error('boom');
    });

    const event = {
      data: { workerId: 2, configuration: 'cfg', gekkoConfigFolderPath: '/tmp', gekkoExec: '/gekko' },
    } as MessageEvent;
    await onmessage(event);

    expect(postMessage).toHaveBeenCalledWith(expect.stringContaining('Gekko worker n°2 failed'));
    expect(exitMock as Mock).toHaveBeenCalled();
  });
});
