import path from 'path';
export const DEFAULTS = {
  MAX_WORKERS: 1,
  GEKKO_CONFIG_DIR: path.join('..', 'gekko2', 'config'),
  GEKKO_SCRIPT: path.join('..', 'gekko2', 'dist', 'gekko.js'),
  TEMPLATE_PATH: path.join('.', 'template', 'template.yml'),
} as const;
