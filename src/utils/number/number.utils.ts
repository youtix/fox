export const countDecimals = (n: number): number => {
  const [, fraction = ''] = n.toString().split('.');
  return fraction.length;
};

export function* buildRange([lo, hi]: [number, number]) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo >= hi)
    throw new Error('Range bounds must be finite numbers in ascending order');
  const decimals = Math.max(countDecimals(lo), countDecimals(hi));
  const step = 1 / 10 ** decimals;
  for (let v = lo; v <= hi + 1e-12; v += step) yield +v.toFixed(decimals);
}
