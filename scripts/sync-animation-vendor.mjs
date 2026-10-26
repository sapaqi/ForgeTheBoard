import { mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'assets/vendor');
await mkdir(target, { recursive: true });
for (const [source, destination] of [
  ['motion/dist/motion.js', 'motion.js'],
  ['three/build/three.module.js', 'three.module.js'],
  ['three/build/three.core.js', 'three.core.js'],
  ['motion/LICENSE.md', 'MOTION-LICENSE.txt'],
  ['three/LICENSE', 'THREE-LICENSE.txt']
]) {
  await copyFile(path.join(root, 'node_modules', source), path.join(target, destination));
}
const versions = {};
for (const name of ['motion', 'three']) {
  versions[name] = JSON.parse(await readFile(path.join(root, 'node_modules', name, 'package.json'), 'utf8')).version;
}
console.log('Local animation dependencies:', versions);
