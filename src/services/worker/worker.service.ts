import { dump } from 'js-yaml';
import { merge } from 'lodash-es';
import path from 'path';
import type { WorkerArguments } from '../../types/worker.types';
import { debug, error, info } from '../logger/logger.service';
import { gekkoConfigFolderPath, gekkoExec, maxWorkers, workerPath } from '../parameters/parameters.service';

export const runWorker = async (
  args: WorkerArguments,
  workerPath = path.join('.', 'src', 'workers', 'gekkoWorker.ts'),
  options?: WorkerOptions,
): Promise<string> =>
  new Promise((resolve, reject) => {
    debug(`Executing worker n°${args.workerId}`);
    try {
      const worker = new Worker(workerPath, options);
      // Don't keep the main thread alive after worker is done
      worker.unref();
      worker.onmessage = event => {
        debug(event.data);
        resolve(event.data);
      };
      worker.onerror = (errorEvent: ErrorEvent) => {
        error(`Worker error: ${errorEvent.message}`);
        reject();
      };
      worker.postMessage(args);
    } catch (err) {
      error(`Error creating worker: ${err}`);
      reject(err);
    }
  });

export const runWorkers = async (argsConfigs: Generator<{ [x: string]: unknown }>, template: object): Promise<void> => {
  const running: Promise<unknown>[] = [];
  let workerId = 0;

  for (const argsConfig of argsConfigs) {
    const config = merge({}, template, argsConfig);
    workerId += 1;

    const workerPromise = runWorker(
      {
        workerId,
        configuration: dump(config),
        gekkoConfigFolderPath,
        gekkoExec,
      },
      workerPath,
    )
      .catch(reason => {
        error(`Worker queue rejected: ${reason}`);
      })
      .finally(() => {
        const idx = running.indexOf(workerPromise);
        if (idx !== -1) running.splice(idx, 1);
      });

    running.push(workerPromise);
    info(`Launching worker ${workerId}`);

    if (running.length >= maxWorkers) await Promise.race(running);
  }

  await Promise.allSettled(running);
};

export const runWorkerBatch = async (configs: object[]) => {
  info(`Launching ${configs.length} worker(s)`);
  const results = await Promise.allSettled(
    configs.map((config, index) =>
      runWorker({ workerId: index + 1, configuration: dump(config), gekkoConfigFolderPath, gekkoExec }, workerPath),
    ),
  );
  results.filter(r => r.status === 'rejected').forEach(r => error(`Worker batch rejected: ${r.reason}`));
};
