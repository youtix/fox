import type { Primitive, Template } from '@/types/worker.types';
import { buildRange } from '../../utils/number/number.utils';
import { isPlainObject } from '../../utils/object/object.utils';

function* expandValue(value?: unknown): Generator<unknown> {
  if (Array.isArray(value) && value.length === 2 && value.every(v => typeof v === 'number' && Number.isFinite(v))) {
    yield* buildRange(value as [number, number]);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) yield item;
    return;
  }

  if (isPlainObject(value)) {
    for (const nested of generateConfigs(value)) yield nested;
    return;
  }

  yield value as Primitive;
}
export function* depthFirstSearch<T extends Template>(
  keys: (keyof T)[],
  tpl: T,
  depth = 0,
  acc: Partial<T> = {},
): Generator<T> {
  if (depth === keys.length) {
    yield acc as T;
    return;
  }

  const key = keys[depth];
  for (const variant of expandValue(tpl[key!])) {
    yield* depthFirstSearch(keys, tpl, depth + 1, { ...acc, [key!]: variant });
  }
}

export function* generateConfigs<T extends Template>(template: T): Generator<T> {
  const keys = Object.keys(template);
  yield* depthFirstSearch(keys, template);
}
