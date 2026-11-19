import { Request } from 'express';

const REQUEST_START_TIME = Symbol('REQUEST_START_TIME');

type TimedRequest = Request & { [REQUEST_START_TIME]?: bigint };

export function markRequestStart(req: Request): void {
  (req as TimedRequest)[REQUEST_START_TIME] = process.hrtime.bigint();
}

export function getElapsedMs(req: Request): number | undefined {
  const start = (req as TimedRequest)[REQUEST_START_TIME];
  return start === undefined ? undefined : Number(process.hrtime.bigint() - start) / 1e6;
}

export function formatElapsed(elapsedMs?: number): string {
  return elapsedMs === undefined ? '-' : `${elapsedMs.toFixed(2)}ms`;
}
