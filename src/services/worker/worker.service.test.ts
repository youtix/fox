import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { debug, error, info } from '../logger/logger.service';
import { runWorker, runWorkerBatch, runWorkers } from './worker.service';

vi.mock('js-yaml', () => ({
  dump: (obj: unknown) => JSON.stringify(obj),
}));

vi.mock(import('../logger/logger.service'), () => ({
  debug: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock(import('../parameters/parameters.service'), () => ({
  gekkoConfigFolderPath: '/gekko/cfg',
  maxWorkers: 2,
  gekkoExec: '/gekko/gekkoExec',
}));

function makeWorkerClass(shouldReject: (id: number) => boolean = () => false) {
  return class {
    onmessage: ((ev: unknown) => void) | null = null;
    onerror: ((ev: unknown) => void) | null = null;

    unref() {
      /* noop */
    }

    postMessage(args: { workerId: number }) {
      setTimeout(() => {
        if (shouldReject(args.workerId)) {
          this.onerror?.({ message: `fail-${args.workerId}` });
        } else {
          this.onmessage?.({ data: `done-${args.workerId}` });
        }
      }, 0);
    }
  } as unknown as typeof Worker;
}

describe('worker service', () => {
  afterEach(() => {
    // clean up the global Worker stub & mocks
    // @ts-expect-error Node has no built-in Worker
    delete global.Worker;
    vi.clearAllMocks();
  });
  describe('runWorker', () => {
    it.each`
      label        | shouldReject
      ${'success'} | ${false}
      ${'failure'} | ${true}
    `('should handles $label', async ({ shouldReject }) => {
      global.Worker = makeWorkerClass(() => shouldReject);

      const p = runWorker({
        workerId: 1,
        configuration: '',
        gekkoConfigFolderPath: '',
        gekkoExec: '',
      });

      if (shouldReject) {
        await expect(p).rejects.toBeUndefined();
        expect(error).toHaveBeenCalledWith(expect.stringMatching(/Worker error/));
      } else {
        await expect(p).resolves.toBe('done-1');
        expect(debug).toHaveBeenCalledWith('Executing worker n°1');
        expect(debug).toHaveBeenLastCalledWith('done-1');
      }
    });
  });

  describe('runWorkers', () => {
    beforeEach(() => {
      global.Worker = makeWorkerClass();
    });

    it('should flushes batches whenever "maxWorkers" is reached and once at the end', async () => {
      function* gen(n: number) {
        for (let i = 0; i < n; i++) yield { id: i };
      }

      await runWorkers(gen(5), { foo: 'bar' }); // 5 items, maxWorkers = 2

      // Expect 3 batches: 2 + 2 + 1
      const launchMsgs = (info as Mock).mock.calls.map(([m]) => m as string);
      expect(launchMsgs).toEqual(['Launching 2 worker(s)', 'Launching 2 worker(s)', 'Launching 1 worker(s)']);
    });
  });

  describe('runWorkerBatch', () => {
    const configs = [{ a: 1 }, { a: 2 }, { a: 3 }];

    it.each`
      label            | workerFactory                            | expectedErrors
      ${'all resolve'} | ${() => makeWorkerClass()}               | ${0}
      ${'one rejects'} | ${() => makeWorkerClass(id => id === 2)} | ${1}
    `('should $label', async ({ workerFactory, expectedErrors }) => {
      global.Worker = workerFactory();

      await runWorkerBatch(configs);

      expect(info).toHaveBeenCalledWith('Launching 3 worker(s)');

      const errMsgs = (error as Mock).mock.calls
        .map(([msg]) => msg as string)
        .filter(m => m.startsWith('Worker batch rejected'));
      expect(errMsgs).toHaveLength(expectedErrors);
    });
  });
});
