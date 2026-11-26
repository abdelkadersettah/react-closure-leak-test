import { useEffect } from 'react';
import { MB, track } from '../tracker';

// A tiny event bus that lives outside React, like a theme store or a WebSocket.
const listeners = new Set<() => void>();
export const themeBus = {
  on: (fn: () => void) => listeners.add(fn),
  off: (fn: () => void) => listeners.delete(fn),
  size: () => listeners.size,
};

const repaint = () => {};
const buildSeries = (rawData: number[]) => track(new Uint8Array(5 * MB + rawData.length)); // ~5 MB

// Example 2 from the article: the listener never reads `series`,
// but it was created in a render whose context holds `series`.
export function Chart({ rawData, cleanup }: { rawData: number[]; cleanup: boolean }) {
  const series = buildSeries(rawData);
  const getTooltip = (index: number) => series[index];

  useEffect(() => {
    const onThemeChange = () => repaint();
    themeBus.on(onThemeChange);
    if (cleanup) return () => void themeBus.off(onThemeChange);
  }, [cleanup]);

  return <p>Chart mounted. Tooltip for point 0: {getTooltip(0)}</p>;
}
