import { dump } from 'js-yaml';
import { merge } from 'lodash-es';
import path from 'path';
import type { WorkerArguments } from '../../types/worker.types';
import { debug, error, info } from '../logger/logger.service';
import { gekkoConfigFolderPath, gekkoScript, maxWorkers } from '../parameters/parameters.service';

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
  const configs: object[] = [];
  for (const argsConfig of argsConfigs) {
    // Override template with arguments config
    configs.push(merge({}, template, argsConfig));
    if (configs.length === maxWorkers) {
      await runWorkerBatch(configs);
      configs.length = 0;
    }
  }
  // Flush remaining workers
  if (configs.length) {
    await runWorkerBatch(configs);
    configs.length = 0;
  }
};

export const runWorkerBatch = async (configs: object[]) => {
  info(`Launching ${configs.length} worker(s)`);
  const results = await Promise.allSettled(
    configs.map((config, index) =>
      runWorker({ workerId: index + 1, configuration: dump(config), gekkoConfigFolderPath, gekkoScript }),
    ),
  );
  results.filter(r => r.status === 'rejected').forEach(r => error(`Worker batch rejected: ${r.reason}`));
};
