import { describe, expect, it, vi } from 'vitest';
import { depthFirstSearch, generateConfigs } from './configuration.service';

vi.mock('../../utils/object/object.utils', () => ({
  isPlainObject: (val: unknown) =>
    val !== null && typeof val === 'object' && Object.getPrototypeOf(val) === Object.prototype,
}));

describe('depthFirstSearch', () => {
  it.each`
    template                   | keys          | expected
    ${{ a: 1 }}                | ${['a']}      | ${[{ a: 1 }]}
    ${{ a: [1, 3] }}           | ${['a']}      | ${[{ a: 1 }, { a: 2 }, { a: 3 }]}
    ${{ a: [1, 2], b: ['x'] }} | ${['a', 'b']} | ${[{ a: 1, b: 'x' }, { a: 2, b: 'x' }]}
  `('yields the Cartesian product for $template', ({ template, keys, expected }) => {
    const actual = [...depthFirstSearch(keys as (keyof typeof template)[], template)];
    expect(actual).toEqual(expected);
  });
});

describe('generateConfigs', () => {
  it.each`
    template                      | expected
    ${{ a: 42 }}                  | ${[{ a: 42 }]}
    ${{ a: [1, 2] }}              | ${[{ a: 1 }, { a: 2 }]}
    ${{ a: [1, 6, 2] }}           | ${[{ a: 1 }, { a: 3 }, { a: 5 }, { a: 6 }]}
    ${{ color: ['red', 'blue'] }} | ${[{ color: 'red' }, { color: 'blue' }]}
  `('expands simple templates → $expected.length config(s)', ({ template, expected }) => {
    const actual = [...generateConfigs(template)];
    expect(actual).toEqual(expected);
  });

  it('handles nested objects and builds the full cross-product', () => {
    const template = {
      size: [10, 12, 2],
      color: ['red', 'blue'],
      style: { bold: [true, false] },
    };

    const configs = [...generateConfigs(template)];
    expect(configs).toHaveLength(8);
    expect(configs).toStrictEqual([
      { size: 10, color: 'red', style: { bold: true } },
      { size: 10, color: 'red', style: { bold: false } },
      { size: 10, color: 'blue', style: { bold: true } },
      { size: 10, color: 'blue', style: { bold: false } },
      { size: 12, color: 'red', style: { bold: true } },
      { size: 12, color: 'red', style: { bold: false } },
      { size: 12, color: 'blue', style: { bold: true } },
      { size: 12, color: 'blue', style: { bold: false } },
    ]);
  });
});
