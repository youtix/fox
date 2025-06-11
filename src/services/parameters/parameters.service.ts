import { Command } from 'commander';
import type { FoxArguments } from '../../types/worker.types';
import { DEFAULTS } from './parameters.const';

export function buildProgram(): Command {
  return new Command()
    .name('fox')
    .description('Fox program helps Gekko find the best strategy')
    .option('-w, --max-workers <number>', 'Maximum number of workers to use')
    .option('-t, --template-path <string>', 'Path to the template file')
    .option('-g, --gekko-folder <string>', 'Folder path for Gekko configuration files')
    .option('-s, --gekko-exec <string>', 'Gekko executable path')
    .allowUnknownOption(true)
    .allowExcessArguments(true);
}

export function parseFoxCliArgs(argv: string[] = process.argv.slice(2), env = process.env) {
  const program = buildProgram();

  // Capture unknown options before Commander throws them away
  const { unknown: unknownArgs } = program.parseOptions(argv);

  // Parse *known* ones
  program.parse(argv, { from: 'user' });
  const opts = program.opts<FoxArguments>();

  return {
    maxWorkers: +(opts.maxWorkers ?? env.FOX_MAX_WORKER ?? DEFAULTS.MAX_WORKERS),
    gekkoConfigFolderPath: opts.gekkoFolder ?? env.FOX_GEKKO_CONFIG_FOLDER_PATH ?? DEFAULTS.GEKKO_CONFIG_DIR,
    gekkoExec: opts.gekkoExec ?? env.FOX_GEKKO_EXEC ?? DEFAULTS.GEKKO_EXEC,
    templatePath: opts.templatePath ?? env.FOX_TEMPLATE_PATH ?? DEFAULTS.TEMPLATE_PATH,
    unknownArgs,
  };
}

const { maxWorkers, templatePath, gekkoConfigFolderPath, gekkoExec, unknownArgs } = parseFoxCliArgs();

export { gekkoConfigFolderPath, gekkoExec, maxWorkers, templatePath, unknownArgs };
