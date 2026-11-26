import { useEffect, useState } from 'react';
import { liveCount } from './tracker';
import { Editor } from './examples/Editor';
import { EditorFixed } from './examples/EditorFixed';
import { Chart, themeBus } from './examples/Chart';

const demos = {
  editor: { title: 'Example: two useCallback hooks (leaky)', size: 10 },
  'editor-fixed': { title: 'Example: same component, object kept in a ref (fixed)', size: 10 },
  chart: { title: 'Example 2: subscription without cleanup (leaky)', size: 5 },
  'chart-cleanup': { title: 'Example 2: subscription with cleanup (fixed)', size: 5 },
} as const;
type DemoName = keyof typeof demos;

const params = new URLSearchParams(location.search);
const demo = (params.get('demo') ?? 'editor') as DemoName;

function ChartDemo({ cleanup }: { cleanup: boolean }) {
  const [mounted, setMounted] = useState(false);
  return (
    <div className="buttons">
      <button id="toggle" onClick={() => setMounted((m) => !m)}>
        {mounted ? 'Unmount chart' : 'Mount chart'}
      </button>
      {mounted && <Chart rawData={[]} cleanup={cleanup} />}
    </div>
  );
}

function LiveCounter() {
  const [live, setLive] = useState(liveCount());
  const [listeners, setListeners] = useState(themeBus.size());
  useEffect(() => {
    const id = setInterval(() => {
      setLive(liveCount());
      setListeners(themeBus.size());
    }, 300);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="counter">
      Big objects still in memory: <strong id="live">{live}</strong> (about {live * demos[demo].size} MB)
      {demo.startsWith('chart') && <> · listeners on the bus: {listeners}</>}
    </p>
  );
}

export default function App() {
  return (
    <main>
      <h1>React closure leak test</h1>
      <nav>
        {(Object.keys(demos) as DemoName[]).map((name) => (
          <a key={name} href={`?demo=${name}`} aria-current={name === demo ? 'page' : undefined}>
            {name}
          </a>
        ))}
      </nav>
      <h2>{demos[demo].title}</h2>
      {demo === 'editor' && <Editor />}
      {demo === 'editor-fixed' && <EditorFixed />}
      {demo === 'chart' && <ChartDemo cleanup={false} />}
      {demo === 'chart-cleanup' && <ChartDemo cleanup />}
      <LiveCounter />
      <p className="hint">
        The counter drops only after the garbage collector runs. To force it: DevTools, Memory tab, trash icon
        ("Collect garbage").
      </p>
    </main>
  );
}
