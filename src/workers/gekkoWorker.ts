import type { WorkerArguments } from '@/types/worker.types';
import { spawn } from 'bun';
import { rm, writeFile } from 'fs/promises';
import path from 'path';

declare var self: Worker;

self.onmessage = async (event: MessageEvent<WorkerArguments>) => {
  const { workerId, gekkoConfigFolderPath, configuration, gekkoScript } = event.data;
  const configFilePath = path.join(gekkoConfigFolderPath, `config-${workerId}.yml`);
  await rm(configFilePath, { force: true });
  await writeFile(configFilePath, configuration, 'utf-8');

  const env = {
    ...process.env,
    GEKKO_LOG_LEVEL: 'error',
    GEKKO_CONFIG_FILE_PATH: configFilePath,
  };

  const proc = spawn({ cmd: ['bun', gekkoScript], env, stdout: 'inherit' });
  await proc.exited;

  const usage = proc.resourceUsage();

  postMessage(
    [
      `Gekko worker n°${workerId} done !`,
      `Max memory used: ${usage?.maxRSS} bytes.`,
      `CPU time (user): ${usage?.cpuTime.user} µs.`,
      `CPU time (system): ${usage?.cpuTime.system} µs.`,
    ].join(' '),
  );
};
