# React closure leak test

A small Vite + React 19 app that reproduces the `useCallback` closure memory leak from
[How useCallback Keeps Old Renders in Memory](https://kadersettah.com/blogs/react-usecallback-closure-memory-leak).

Each big object is registered with a `FinalizationRegistry`, so the page shows how many are still alive.

## Demos

Open `?demo=<name>`:

| Demo | What it does |
| --- | --- |
| `editor` | Two `useCallback` hooks + a 10 MB object created on every render (leaky) |
| `editor-fixed` | Same component, object created once in a ref |
| `chart` | Event-bus subscription in `useEffect` without cleanup (leaky) |
| `chart-cleanup` | Same, with cleanup |

## Run

```bash
npm install
npm run dev            # open http://localhost:5173/?demo=editor
npm run measure        # production build, measured in headless Chrome
npm run measure:dev    # same against the dev server
```

`measure` needs Google Chrome installed (set `CHROME_PATH` if it is not in the default macOS location).
It clicks A and B in turn 10 times (or mounts/unmounts the chart 10 times), forces garbage collection
through the DevTools protocol, and prints how many big objects are still alive.

## Result (Chrome 158, React 19.3.1, 2026-11-26)

```txt
editor (leaky)         after: 11 objects (110 MB)
editor-fixed (ref)     after:  1 object  (10 MB)
chart, no cleanup      after: 10 objects (50 MB)
chart, with cleanup    after:  0 objects (0 MB)
```
