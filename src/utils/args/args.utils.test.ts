import { describe, expect, it } from 'vitest';
import { parseArgs } from './args.utils';

describe('parseArgs', () => {
  it.each`
    desc                              | argv                                                                                   | expected
    ${'complex example'}              | ${['--strategy.period', '12,20', '--watch.asset', 'BTC', '--strategy.upper', '20,40']} | ${{ strategy: { period: [12, 20], upper: [20, 40] }, watch: { asset: 'BTC' } }}
    ${'numeric scalar'}               | ${['--foo.bar', '42']}                                                                 | ${{ foo: { bar: 42 } }}
    ${'zero scalar'}                  | ${['--zero', '0']}                                                                     | ${{ zero: 0 }}
    ${'negative float scalar'}        | ${['--neg.float', '-1.5']}                                                             | ${{ neg: { float: -1.5 } }}
    ${'boolean true'}                 | ${['--flags.enabled', 'true']}                                                         | ${{ flags: { enabled: true } }}
    ${'boolean false'}                | ${['--flags.enabled', 'false']}                                                        | ${{ flags: { enabled: false } }}
    ${'string scalar'}                | ${['--hello.world', 'hi']}                                                             | ${{ hello: { world: 'hi' } }}
    ${'numeric list'}                 | ${['--list.items', '1,2,3']}                                                           | ${{ list: { items: [1, 2, 3] } }}
    ${'numeric list with spaces'}     | ${['--spaced', ' 1 , 2 , 3 ']}                                                         | ${{ spaced: [1, 2, 3] }}
    ${'numeric list containing 0'}    | ${['--nums', '0,1']}                                                                   | ${{ nums: [0, 1] }}
    ${'negative integer list'}        | ${['--neg.list', '-1,-2']}                                                             | ${{ neg: { list: [-1, -2] } }}
    ${'float list'}                   | ${['--floats.list', '1.2,3.4']}                                                        | ${{ floats: { list: [1.2, 3.4] } }}
    ${'mixed list drops non-numbers'} | ${['--clean.list', '1,a,2']}                                                           | ${{ clean: { list: [1, 2] } }}
    ${'all non-numeric list → []'}    | ${['--empty.list', 'a,b']}                                                             | ${{ empty: { list: [] } }}
    ${'equal-style scalar'}           | ${['--mode=test']}                                                                     | ${{ mode: 'test' }}
    ${'equal-style list'}             | ${['--vals=1,2']}                                                                      | ${{ vals: [1, 2] }}
    ${'duplicate flags merge'}        | ${['--foo.bar', '1', '--foo.baz', '2']}                                                | ${{ foo: { bar: 1, baz: 2 } }}
    ${'deep dotted path'}             | ${['--a.b.c', '5']}                                                                    | ${{ a: { b: { c: 5 } } }}
    ${'missing value'}                | ${['--oops']}                                                                          | ${{}}
    ${'missing value equal-style'}    | ${['--nope=']}                                                                         | ${{}}
  `('$desc', ({ argv, expected }) => {
    expect(parseArgs(argv as string[])).toEqual(expected);
  });
});
