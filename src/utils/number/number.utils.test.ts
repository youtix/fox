import { describe, expect, it } from 'vitest';
import { buildRange, countDecimals } from './number.utils';

describe('countDecimals', () => {
  it.each`
    n         | expected
    ${0}      | ${0}
    ${42}     | ${0}
    ${-3.456} | ${3}
    ${0.1}    | ${1}
    ${2.005}  | ${3}
  `('should returns $expected for $n', ({ n, expected }) => {
    expect(countDecimals(n)).toBe(expected);
  });
});

describe('buildRange', () => {
  it.each`
    bounds          | expected
    ${[1, 3]}       | ${[1, 2, 3]}
    ${[0.1, 0.3]}   | ${[0.1, 0.2, 0.3]}
    ${[1.05, 1.07]} | ${[1.05, 1.06, 1.07]}
  `('should yields the inclusive sequence $expected from $bounds', ({ bounds, expected }) => {
    const result = [...buildRange(bounds as [number, number])];
    expect(result).toEqual(expected);
  });

  it.each`
    bounds
    ${[3, 1]}
    ${[Infinity, 5]}
    ${[0, -Infinity]}
  `('should throws on invalid bounds $bounds', ({ bounds }) => {
    expect(() => [...buildRange(bounds as [number, number])]).toThrow(
      /Range bounds must be finite numbers in ascending order/,
    );
  });
});
