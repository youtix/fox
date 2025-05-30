export const countDecimals = (n: number): number => {
  const [, fraction = ''] = n.toString().split('.');
  return fraction.length;
};

export function* buildRange(bounds: [number, number, number?]): Generator<number> {
  const [lo, hi, rawStep] = bounds;

  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo >= hi)
    throw new Error('Range bounds must be finite numbers in ascending order');

  const step = rawStep ?? 1 / 10 ** Math.max(countDecimals(lo), countDecimals(hi));

  if (!Number.isFinite(step) || step <= 0) throw new Error('Step must be a positive, finite number');

  // Use a common precision so rounding errors do not accumulate.
  const decimals = Math.max(countDecimals(lo), countDecimals(hi), countDecimals(step));
  const fix = (n: number) => +n.toFixed(decimals);
  const epsilon = 10 ** -decimals / 2;

  let last = NaN;
  for (let v = lo; v <= hi + epsilon; v = fix(v + step)) {
    last = fix(v);
    yield last;
  }

  // If the last value fell short (because the step overshot), emit `hi` once.
  if (Math.abs(last - hi) > epsilon) yield fix(hi);
}
