import type { WorkerArguments } from '@/types/worker.types';
import { spawn } from 'bun';
import { rm, writeFile } from 'fs/promises';
import path from 'path';

declare let self: Worker;

self.onmessage = async (event: MessageEvent<WorkerArguments>) => {
  const { workerId, gekkoConfigFolderPath, configuration, gekkoExec } = event.data;
  const configFilePath = path.join(gekkoConfigFolderPath, `config-${workerId}.yml`);
  let proc: ReturnType<typeof spawn> | undefined;

  try {
    // ─── Prepare config file ────────────────────────────────────────────────
    await rm(configFilePath, { force: true });
    await writeFile(configFilePath, configuration, 'utf-8');

    // ─── Launch Gekko ───────────────────────────────────────────────────────
    const env = {
      ...process.env,
      GEKKO_LOG_LEVEL: 'error',
      GEKKO_CONFIG_FILE_PATH: configFilePath,
    };

    proc = spawn({ cmd: [gekkoExec], env, stdout: 'inherit' });
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
  } catch (err) {
    postMessage(`Gekko worker n°${workerId} failed - ${(err as Error).message}`);
  } finally {
    // ─── Always attempt cleanup ────────────────────────────────────────────
    try {
      await rm(configFilePath, { force: true });
    } catch {
      /* ignore */
    }

    if (proc && !proc.killed)
      try {
        proc.kill('SIGTERM');
      } catch {
        /* ignore */
      }

    // End the worker even if anything above threw
    process.exit();
  }
};
