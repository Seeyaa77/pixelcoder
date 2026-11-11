import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeOutput, matchesExpected, prepareCppSource, JS_TIMEOUT_MS, PYTHON_TIMEOUT_MS, CPP_TIMEOUT_MS, CPP_PROVIDER_TIMEOUT_MS, interpretWandboxResult, interpretPistonResult, hasRunner, staticCheck } from '../src/lib/evaluator.js';

test('normalizeOutput unifies newlines and trims trailing spaces per line', () => {
  assert.equal(normalizeOutput('a\r\nb\r\n'), 'a\nb');
  assert.equal(normalizeOutput('  a  \n b\t\n'), '  a\n b');
  assert.equal(normalizeOutput('\n\nAria\n1\n\n'), 'Aria\n1');
  assert.equal(normalizeOutput(null), '');
  assert.equal(normalizeOutput(undefined), '');
  assert.equal(normalizeOutput(42), '42');
});

test('matchesExpected accepts exact output', () => {
  assert.equal(matchesExpected('Aria\n1', 'Aria\n1'), true);
  assert.equal(matchesExpected('Aria\r\n1\r\n', 'Aria\n1'), true);
});

test('matchesExpected tolerates spacing and bracket differences', () => {
  assert.equal(matchesExpected('1,2,3,4', '1, 2, 3, 4'), true);
  assert.equal(matchesExpected('[12,20,30]', '12, 20, 30'), true, 'console.log(array) vs literal');
  assert.equal(matchesExpected('Byte Pixel Blade', 'Byte  Pixel Blade'), true);
});

test('matchesExpected rejects wrong output and empty expectations', () => {
  assert.equal(matchesExpected('Aria\n2', 'Aria\n1'), false);
  assert.equal(matchesExpected('', 'something'), false);
  assert.equal(matchesExpected('anything', ''), false);
  assert.equal(matchesExpected('anything', null), false);
});

test('prepareCppSource wraps bare snippets into a compilable program', () => {
  const wrapped = prepareCppSource('cout << 20;');
  assert.match(wrapped, /#include <iostream>/);
  assert.match(wrapped, /using namespace std;/);
  assert.match(wrapped, /int main\(\) \{/);
  assert.match(wrapped, /cout << 20;/);
  assert.match(wrapped, /return 0;/);
});

test('prepareCppSource leaves complete programs intact', () => {
  const program = '#include <iostream>\nusing namespace std;\nint main() { cout << "ok"; return 0; }';
  assert.equal(prepareCppSource(program), program);
});

test('prepareCppSource adds <vector> when std::vector is used', () => {
  const wrapped = prepareCppSource('std::vector<int> v; cout << v.size();');
  assert.match(wrapped, /#include <vector>/);
});

test('timeouts are sane and documented', () => {
  assert.equal(JS_TIMEOUT_MS, 5000);
  assert.equal(CPP_TIMEOUT_MS, 20000, 'total budget across the C++ providers');
  assert.equal(CPP_PROVIDER_TIMEOUT_MS, 10000, 'each C++ provider gets half the budget');
  assert.equal(PYTHON_TIMEOUT_MS, 20000);
});

test('prepareCppSource auto-includes the headers a snippet needs', () => {
  const vectorSource = prepareCppSource('vector<int> v;\nv.push_back(1);\ncout << v.size();');
  assert.match(vectorSource, /#include <vector>/);
  assert.match(vectorSource, /#include <iostream>/);
  assert.match(vectorSource, /using namespace std;/);
  assert.match(vectorSource, /int main\(\)/);

  const stringSource = prepareCppSource('string name = "Aria";\ncout << name;');
  assert.match(stringSource, /#include <string>/);

  const smartSource = prepareCppSource('auto p = make_unique<int>(5);\ncout << *p;');
  assert.match(smartSource, /#include <memory>/);

  const sortSource = prepareCppSource('sort(v.begin(), v.end());');
  assert.match(sortSource, /#include <algorithm>/);
});

test('prepareCppSource never duplicates headers or wraps an existing main', () => {
  const full = '#include <vector>\nint main() {\n  vector<int> v;\n  return 0;\n}';
  const prepared = prepareCppSource(full);
  assert.equal((prepared.match(/#include <vector>/g) || []).length, 1);
  assert.equal((prepared.match(/int main\(/g) || []).length, 1);
  assert.equal((prepared.match(/using namespace std;/g) || []).length, 1, 'namespace added exactly once');
});

test('interpretWandboxResult maps success and failure payloads', () => {
  const ok = interpretWandboxResult({ status: '0', compiler_error: '', program_output: 'Ready Player 1', program_error: '' });
  assert.deepEqual(ok, { ok: true, output: 'Ready Player 1', error: '' });

  const compileFail = interpretWandboxResult({ status: '1', compiler_error: 'main.cpp:1: error', program_output: '' });
  assert.equal(compileFail.ok, false);
  assert.match(compileFail.error, /error/);

  const runtimeFail = interpretWandboxResult({ status: '1', program_output: '', program_error: 'Segmentation fault' });
  assert.equal(runtimeFail.ok, false);
  assert.match(runtimeFail.error, /Segmentation/);
});

test('interpretPistonResult maps success, compile failure and runtime failure', () => {
  const ok = interpretPistonResult({ compile: { code: 0, stderr: '' }, run: { code: 0, stdout: '75 75', stderr: '' } });
  assert.deepEqual(ok, { ok: true, output: '75 75', error: '' });

  const compileFail = interpretPistonResult({ compile: { code: 1, stderr: 'error: expected ;' }, run: {} });
  assert.equal(compileFail.ok, false);
  assert.match(compileFail.error, /expected/);

  const runtimeFail = interpretPistonResult({ compile: { code: 0 }, run: { code: 139, stdout: '', stderr: 'segfault' } });
  assert.equal(runtimeFail.ok, false);
  assert.match(runtimeFail.error, /segfault/);
});

test('every syllabus track has an execution runner', () => {
  for (const trackId of ['javascript', 'python', 'cpp']) {
    assert.equal(hasRunner(trackId), true, `${trackId} must be runnable`);
  }
  assert.equal(hasRunner('rust'), false);
});

test('staticCheck never grants a free pass', () => {
  const stage = { regexMatch: String.raw`cout\s*<<`, expectedOutput: 'Ready Player 1' };
  assert.equal(staticCheck(stage, 'cout << "Ready Player 1";'), true, 'literal answer is verifiable offline');
  assert.equal(staticCheck(stage, 'cout << "something else";'), false, 'wrong literal fails');
  assert.equal(staticCheck(stage, 'printf("Ready Player 1");'), false, 'pattern must match too');
  assert.equal(staticCheck(null, 'cout << "Ready Player 1";'), false);
});
