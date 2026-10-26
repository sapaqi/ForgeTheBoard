import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const queue = ['index.html', 'compare.html', 'assets/qa/no-javascript.html'];
const visited = new Set();
while (queue.length) {
  const relative = queue.shift();
  if (visited.has(relative)) continue;
  visited.add(relative);
  const filename = path.resolve(root, relative);
  assert(filename.startsWith(root + path.sep), `Reference outside project: ${relative}`);
  assert((await stat(filename)).isFile(), `Missing file: ${relative}`);
  if (!/\.(?:html|css|m?js)$/.test(relative)) continue;
  const source = await readFile(filename, 'utf8');
  if (/\.m?js$/.test(relative)) execFileSync(process.execPath, ['--check', filename], { stdio: 'pipe' });
  const references = [
    ...source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g),
    ...source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g),
    ...source.matchAll(/\b(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g)
  ].map(match => match[1]);
  for (let reference of references) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue;
    reference = decodeURIComponent(reference);
    if (reference.startsWith('#')) continue;
    assert(!reference.startsWith('/'), `Root-absolute URL breaks repository hosting: ${relative} → ${reference}`);
    const clean = reference.split(/[?#]/)[0];
    if (!clean || clean.endsWith('/')) continue;
    queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(relative), clean)));
  }
}
for (const relative of ['app.js', 'server.mjs', 'scripts/sync-animation-vendor.mjs', 'scripts/check-package.mjs']) {
  execFileSync(process.execPath, ['--check', path.join(root, relative)], { stdio: 'pipe' });
}
for (const relative of ['assets/vendor/MOTION-LICENSE.txt', 'assets/vendor/THREE-LICENSE.txt', 'assets/fonts/saira-OFL.txt', 'assets/fonts/imfellenglish-OFL.txt']) {
  assert((await stat(path.join(root, relative))).size > 0, `Missing license: ${relative}`);
}
const files = [];
async function list(directory = '') {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      assert(!['node_modules', '.pnpm-store', '.git', '.tools', 'output', 'screenshots', 'references'].includes(entry.name), `Working directory in package: ${relative}`);
      await list(relative);
    } else files.push(relative);
  }
}
await list();
console.log(`Package OK: ${files.length} files; ${visited.size} reachable resources; syntax, licenses and relative paths verified.`);
