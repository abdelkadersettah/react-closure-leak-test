// Measures the leak in real Chrome with a production (or dev) build.
//   npm run measure        -> production build (vite build + vite preview)
//   npm run measure -- dev -> development server
import puppeteer from 'puppeteer-core';
import { createServer, preview } from 'vite';

const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const mode = process.argv[2] === 'dev' ? 'dev' : 'production';
const CLICKS = 10;

const server =
  mode === 'dev'
    ? await (await createServer({ server: { port: 5199 } })).listen()
    : await preview({ preview: { port: 5198 } });
const baseUrl = server.resolvedUrls.local[0];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const version = await browser.version();

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function liveAfterGc(page, cdp) {
  // Force full garbage collection, then give FinalizationRegistry time to report.
  for (let i = 0; i < 3; i++) {
    await cdp.send('HeapProfiler.collectGarbage');
    await wait(150);
  }
  return page.evaluate(() => window.__leak.liveCount());
}

async function run(demo, action) {
  const page = await browser.newPage();
  const cdp = await page.createCDPSession();
  await page.goto(`${baseUrl}?demo=${demo}`, { waitUntil: 'networkidle0' });
  const before = await liveAfterGc(page, cdp);
  await action(page);
  const after = await liveAfterGc(page, cdp);
  await page.close();
  return { before, after };
}

const clickAlternating = async (page) => {
  for (let i = 1; i <= CLICKS; i++) {
    await page.click(i % 2 ? '#a' : '#b');
    await wait(30);
  }
};

const mountUnmountTen = async (page) => {
  for (let i = 0; i < 10; i++) {
    await page.click('#toggle'); // mount
    await wait(30);
    await page.click('#toggle'); // unmount
    await wait(30);
  }
};

const results = [
  ['editor (leaky)', 10, await run('editor', clickAlternating)],
  ['editor-fixed (ref)', 10, await run('editor-fixed', clickAlternating)],
  ['chart, no cleanup', 5, await run('chart', mountUnmountTen)],
  ['chart, with cleanup', 5, await run('chart-cleanup', mountUnmountTen)],
];

console.log(`\nChrome ${version}, React ${mode} build\n`);
for (const [name, mb, { before, after }] of results) {
  console.log(
    `${name.padEnd(22)} before: ${before} objects (${before * mb} MB)   after: ${after} objects (${after * mb} MB)`,
  );
}

await browser.close();
await (mode === 'dev' ? server.close() : server.httpServer.close());
