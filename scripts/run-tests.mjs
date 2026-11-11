/**
 * Cross-platform test runner.
 *
 * `node --test tests/` only accepts a directory on very recent Node versions,
 * so CI (Node 22) failed with "Cannot find module '.../tests'". This wrapper
 * resolves the test files itself and forwards them to `node --test`.
 */
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const testsDir = resolve(here, '..', 'tests');

const files = readdirSync(testsDir)
  .filter((name) => name.endsWith('.test.js') || name.endsWith('.test.mjs'))
  .sort()
  .map((name) => join(testsDir, name));

if (files.length === 0) {
  console.error(`No test files found in ${testsDir}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  cwd: resolve(here, '..'),
});

process.exit(result.status ?? 1);
