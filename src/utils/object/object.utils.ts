import type { Template } from '@/types/worker.types';

export const isPlainObject = (val: unknown): val is Template =>
  typeof val === 'object' && val !== null && Object.getPrototypeOf(val) === Object.prototype;
