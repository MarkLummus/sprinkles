// Copied from 03.5-probe-harness.mjs (lines 19-22 and 26-107) for Phase 8, so the
// walk's server loads no browser library: the harness imports playwright-core
// from the npx cache on its first line. The walk always passes `appRoot`; from
// this directory `REPO_ROOT` resolves three levels up to the repo root.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Three directories up from this file's own directory: phases/03.5-.../ ->
// phases/ -> .planning/ -> repo root. Resolved from the file's own URL so
// this works from any worktree, not just the one that authored it.
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream';
}

// Creates one static server rooted at `root`. When `spaFallback` is true, a
// request path with no file extension that does not resolve to a file
// serves root/index.html instead (the app's own client-side routing).
function createStaticServer(root, { spaFallback = false } = {}) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let relPath = decodeURIComponent(url.pathname);
      let filePath = path.join(root, relPath);

      const isExistingFile = (candidate) => existsSync(candidate) && statSync(candidate).isFile();

      const hasExtension = path.extname(relPath) !== '';
      if (spaFallback && !hasExtension && !isExistingFile(filePath)) {
        filePath = path.join(root, 'index.html');
      }

      if (!isExistingFile(filePath) || !filePath.startsWith(root)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
      res.end(body);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

// Two throwaway static servers on ephemeral 127.0.0.1 ports: `app` serves
// the build (REPO_ROOT/app/dist, SPA fallback for client-side routes),
// `repo` serves the whole repo tree (for the sketch 011 boards under
// .planning/sketches/). Neither binds --host or 0.0.0.0 (T-03.5-69).
// `appRoot` (03.7-02) lets a later probe serve a build written elsewhere (a
// scratch --outDir), so measuring never needs a write to app/dist, which
// Mark's own `vite preview` serves. The default is unchanged.
export async function startServers({ appRoot = path.join(REPO_ROOT, 'app', 'dist') } = {}) {
  const appServer = createStaticServer(appRoot, { spaFallback: true });
  const repoServer = createStaticServer(REPO_ROOT);

  const appUrl = await listen(appServer);
  const repoUrl = await listen(repoServer);

  return {
    appUrl,
    repoUrl,
    close: () =>
      Promise.all([
        new Promise((resolve) => appServer.close(resolve)),
        new Promise((resolve) => repoServer.close(resolve)),
      ]),
  };
}
