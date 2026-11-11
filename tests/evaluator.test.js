import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeOutput,
  matchesExpected,
  prepareCppSource,
  JS_TIMEOUT_MS,
  PYTHON_TIMEOUT_MS,
  CPP_TIMEOUT_MS
} from '../src/lib/evaluator.js';

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
  assert.equal(CPP_TIMEOUT_MS, 10000);
  assert.equal(PYTHON_TIMEOUT_MS, 20000);
});
