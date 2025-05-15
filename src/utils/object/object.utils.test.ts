import { describe, expect, it } from 'vitest';
import { isPlainObject } from './object.utils';

class Foo {}
const fooInstance = new Foo();
const objNoProto = Object.create(null);
const date = new Date();

describe('isPlainObject', () => {
  it.each`
    value          | expected | comment
    ${{}}          | ${true}  | ${'empty literal'}
    ${{ a: 1 }}    | ${true}  | ${'simple literal'}
    ${objNoProto}  | ${false} | ${'object with null prototype'}
    ${[]}          | ${false} | ${'array'}
    ${date}        | ${false} | ${'Date instance'}
    ${fooInstance} | ${false} | ${'custom-class instance'}
    ${42}          | ${false} | ${'number primitive'}
    ${'hello'}     | ${false} | ${'string primitive'}
    ${null}        | ${false} | ${'null'}
    ${undefined}   | ${false} | ${'undefined'}
  `('should returns $expected for $comment', ({ value, expected }) => {
    expect(isPlainObject(value)).toBe(expected);
  });
});
