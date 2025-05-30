import { describe, expect, it, vi } from 'vitest';
import { buildProgram, parseFoxCliArgs } from './parameters.service';

vi.mock('./parameters.const', () => ({
  DEFAULTS: {
    MAX_WORKERS: 1,
    GEKKO_CONFIG_DIR: '/gekko/default',
    TEMPLATE_PATH: '/template/default.yml',
  },
}));

describe('buildProgram', () => {
  it('should defines CLI metadata and options', () => {
    const program = buildProgram();

    // Basic metadata
    expect(program.name()).toBe('fox');
    expect(program.description()).toMatch(/Fox program/);

    // Parse a sample arg vector to ensure the options exist & are wired
    program.parse(['--max-workers', '5', '--template-path', '/a', '--gekko-folder', '/b'], { from: 'user' });

    expect(program.opts()).toEqual(
      expect.objectContaining({
        maxWorkers: '5',
        templatePath: '/a',
        gekkoFolder: '/b',
      }),
    );
  });
});

describe('parseFoxCliArgs', () => {
  /** helper to create a fresh env object for each row */
  const env = (obj: Partial<NodeJS.ProcessEnv> = {}) => ({ ...obj }) as NodeJS.ProcessEnv;

  it.each`
    label                             | argv                                                   | envInput                                                                                                     | expected
    ${'CLI overrides env & defaults'} | ${['-w', '4', '-t', '/cli/tpl.yml', '-g', '/cli/cfg']} | ${env({ FOX_MAX_WORKER: '9', FOX_TEMPLATE_PATH: '/env/tpl.yml', FOX_GEKKO_CONFIG_FOLDER_PATH: '/env/cfg' })} | ${{ maxWorkers: 4, templatePath: '/cli/tpl.yml', gekkoConfigFolderPath: '/cli/cfg' }}
    ${'env used when CLI missing'}    | ${[]}                                                  | ${env({ FOX_MAX_WORKER: '3', FOX_TEMPLATE_PATH: '/env/tpl.yml', FOX_GEKKO_CONFIG_FOLDER_PATH: '/env/cfg' })} | ${{ maxWorkers: 3, templatePath: '/env/tpl.yml', gekkoConfigFolderPath: '/env/cfg' }}
    ${'defaults when none provided'}  | ${[]}                                                  | ${env()}                                                                                                     | ${{ maxWorkers: 1, templatePath: '/template/default.yml', gekkoConfigFolderPath: '/gekko/default' }}
  `('should $label', ({ argv, envInput, expected }) => {
    const result = parseFoxCliArgs(argv, envInput);
    expect(result).toEqual(expect.objectContaining(expected));
  });

  it('captures unknown CLI arguments', () => {
    const { unknownArgs } = parseFoxCliArgs(['--foo', 'bar', '--max-workers', '2', '--baz'], env());

    expect(unknownArgs).toEqual(['--foo', 'bar', '--baz']);
  });
});
