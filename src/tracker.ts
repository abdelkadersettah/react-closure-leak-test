// Counts how many big objects are still alive.
// FinalizationRegistry calls us back after the garbage collector frees an object,
// so `created - freed` is the number still held in memory.
let created = 0;
let freed = 0;

const registry = new FinalizationRegistry(() => {
  freed++;
});

export const MB = 1024 * 1024;

export function track<T extends object>(bigObject: T): T {
  created++;
  registry.register(bigObject, null);
  return bigObject;
}

export function liveCount() {
  return created - freed;
}

declare global {
  interface Window {
    __leak: { liveCount: () => number };
  }
}

window.__leak = { liveCount };
