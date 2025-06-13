import path from 'path';
export const DEFAULTS = {
  MAX_WORKERS: 1,
  GEKKO_CONFIG_DIR: path.join('..', 'gekko2', 'config'),
  GEKKO_EXEC: path.join('..', 'gekko2', 'dist', 'gekko'),
  TEMPLATE_PATH: path.join('.', 'template', 'template.yml'),
  WORKER_PATH: path.join('.', 'src', 'workers', 'gekkoWorker.ts'),
} as const;
