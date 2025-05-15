import { isNil, isString, merge } from 'lodash-es';

const chooseWriteType = (value: unknown) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (Array.isArray(value)) return value;
  if (isString(value) && /^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (isString(value)) return value;
  throw new Error(`Unknown type for value: ${JSON.stringify(value)}`);
};

const generateJsonFromParam = (path: string, value?: unknown) => {
  if (value === undefined) return {};
  return path
    .split('.')
    .reverse()
    .reduce((acc, key, i) => (!i ? { [key]: chooseWriteType(value) } : { [key]: acc }), {});
};

const parseValue = (value: string) => {
  if (!value.includes(',')) return value;
  // Lists may contain only numeric literals; non-numeric items are discarded
  return value.split(',').map(Number).filter(Number.isFinite);
};

export const parseArgs = (argv: string[]): Record<string, unknown> =>
  argv.reduce((acc, arg, index, arr) => {
    if (!arg.startsWith('--')) return acc;
    const equalStyleValues = arg.trim().slice(2).split('=', 2);
    const key = equalStyleValues.length === 2 ? equalStyleValues[0] : arg.trim().slice(2);
    const value = equalStyleValues.length === 2 ? equalStyleValues[1] : arr[index + 1]?.trim();
    if (isNil(key) || key === '' || isNil(value) || value === '') return acc;
    return merge(acc, generateJsonFromParam(key, parseValue(value)));
  }, {});
