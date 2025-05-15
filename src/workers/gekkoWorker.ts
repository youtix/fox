import type { WorkerArguments } from '@/types/worker.types';
import { rm, writeFile } from 'fs/promises';
import path from 'path';

declare var self: Worker;

self.onmessage = async (event: MessageEvent<WorkerArguments>) => {
  const { workerId, gekkoConfigFolderPath, configuration } = event.data;
  const configFilePath = path.join(gekkoConfigFolderPath, `config-${workerId}.yml`);
  await rm(configFilePath, { force: true });
  await writeFile(configFilePath, configuration, 'utf-8');

  // TODO run gekko here

  postMessage(`Gekko worker n°${workerId} done !`);
};
