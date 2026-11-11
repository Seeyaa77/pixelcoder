// Real code execution for PixelCoder.
// - JavaScript: sandboxed Web Worker created from a Blob (no DOM access), 5s hard timeout.
// - Python: real CPython via Pyodide, lazily loaded from CDN and reused.
// - C++: remote compiler APIs (Piston with an optional API key, then Wandbox), 20s timeout.
// No npm dependencies are used.

export const JS_TIMEOUT_MS = 5000;
export const PYTHON_TIMEOUT_MS = 20000;
export const CPP_TIMEOUT_MS = 20000;
export const CPP_PROVIDER_TIMEOUT_MS = 10000;

const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};
// Piston's public instance now answers 401 without a key; Wandbox needs no key at all.
const PISTON_API_KEY = ENV.VITE_PISTON_API_KEY || '';
const PISTON_VERSION = ENV.VITE_PISTON_VERSION || '*';
const WANDBOX_COMPILER = ENV.VITE_WANDBOX_COMPILER || 'gcc-head';

export const FALLBACK_NOTICE = 'Execution engine unavailable — static check only';

function now() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function elapsed(startedAt) {
  return Math.max(0, Math.round(now() - startedAt));
}

/**
 * Canonical form used for all output comparisons.
 * - coerces to string
 * - unifies newlines (CRLF/CR -> LF)
 * - trims trailing whitespace on every line
 * - drops leading/trailing blank lines
 */
export function normalizeOutput(text) {
  if (text === null || text === undefined) return '';
  const value = typeof text === 'string' ? text : String(text);
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');
}

function squash(text) {
  return normalizeOutput(text).replace(/\s+/g, '');
}

/**
 * Compare real program output against the syllabus `expectedOutput`.
 * Accepts: exact normalized match, whitespace-insensitive match, and a
 * bracket-insensitive match so that `[12,20,30]` and `12,20,30` agree
 * (console.log style vs. literal array style).
 */
export function matchesExpected(output, expected) {
  const target = normalizeOutput(expected);
  if (!target) return false;

  const actual = normalizeOutput(output);
  if (actual === target) return true;

  const squashedActual = squash(actual);
  const squashedTarget = squash(target);
  if (squashedActual === squashedTarget) return true;

  const debracket = (value) => value.replace(/[[\]]/g, '');
  const looseActual = debracket(squashedActual);
  return looseActual !== '' && looseActual === debracket(squashedTarget);
}

function safeRegexTest(pattern, text) {
  if (!pattern) return true;
  try {
    return new RegExp(pattern).test(String(text || ''));
  } catch {
    return false;
  }
}

// Serialized into the worker. Must stay fully self-contained (no closure refs).
function jsWorkerMain() {
  const MAX_DEPTH = 3;

  function formatValue(value, depth, seen) {
    const level = depth || 0;
    if (typeof value === 'string') return value;
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    const type = typeof value;
    if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
    if (type === 'function') return '[Function ' + (value.name || 'anonymous') + ']';
    if (type === 'symbol') return value.toString();
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (seen.indexOf(value) !== -1) return '[Circular]';
    if (level >= MAX_DEPTH) return Array.isArray(value) ? '[Array]' : '[Object]';

    const nextSeen = seen.concat([value]);

    if (Array.isArray(value)) {
      return value.map((item) => formatValue(item, level + 1, nextSeen)).join(',');
    }
    if (value instanceof Map) {
      return Array.from(value.entries())
        .map((entry) => formatValue(entry[0], level + 1, nextSeen) + ': ' + formatValue(entry[1], level + 1, nextSeen))
        .join(', ');
    }
    if (value instanceof Set) {
      return Array.from(value.values())
        .map((item) => formatValue(item, level + 1, nextSeen))
        .join(', ');
    }
    if (value.toString && value.toString !== Object.prototype.toString) {
      return String(value);
    }
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }

  self.onmessage = async function (event) {
    const logs = [];
    const write = function (...args) {
      logs.push(args.map((arg) => formatValue(arg, 0, [])).join(' '));
    };
    const consoleShim = {
      log: write,
      info: write,
      warn: write,
      error: write,
      debug: write,
      table: write,
      dir: write,
      trace: write,
      group: write,
      groupEnd: function () {},
      time: function () {},
      timeEnd: function () {},
      assert: function (condition, ...args) {
        if (!condition) write('Assertion failed:', ...args);
      }
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction('console', String((event.data && event.data.code) || ''));
      await Promise.resolve(fn(consoleShim));
      // Flush microtasks and zero-delay timers so .then(console.log) is captured.
      await new Promise((resolve) => setTimeout(resolve, 0));
      self.postMessage({ ok: true, logs: logs });
    } catch (error) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
      } catch {
        // ignore flush failure
      }
      self.postMessage({
        ok: false,
        logs: logs,
        error: (error && (error.stack || error.message)) || String(error)
      });
    }
  };
}

/**
 * Execute JavaScript in an isolated Web Worker (no DOM, no app state) with a
 * hard 5 second ceiling enforced by terminate().
 * @returns {Promise<{ok: boolean, output: string, error: string, mode: 'real'|'unavailable', durationMs: number}>}
 */
export function runJavaScript(code) {
  return new Promise((resolve) => {
    const startedAt = now();

    if (
      typeof Worker === 'undefined' ||
      typeof Blob === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function'
    ) {
      resolve({
        ok: false,
        output: '',
        error: 'Web Workers are not available in this browser.',
        mode: 'unavailable',
        durationMs: elapsed(startedAt)
      });
      return;
    }

    const workerSource = `"use strict";(${jsWorkerMain.toString()})();`;
    const blobUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
    let worker = null;
    let settled = false;
    let timer = null;

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      if (timer !== null) clearTimeout(timer);
      try {
        if (worker) worker.terminate();
      } catch {
        // ignore
      }
      URL.revokeObjectURL(blobUrl);
      resolve({ ...payload, durationMs: elapsed(startedAt) });
    };

    try {
      worker = new Worker(blobUrl);
    } catch (error) {
      URL.revokeObjectURL(blobUrl);
      resolve({
        ok: false,
        output: '',
        error: `Could not start the JavaScript sandbox: ${(error && error.message) || error}`,
        mode: 'unavailable',
        durationMs: elapsed(startedAt)
      });
      return;
    }

    timer = setTimeout(() => {
      finish({
        ok: false,
        output: '',
        error: `Execution timed out after ${JS_TIMEOUT_MS / 1000}s. Check for infinite loops.`,
        mode: 'real'
      });
    }, JS_TIMEOUT_MS);

    worker.onmessage = (event) => {
      const data = event.data || {};
      finish({
        ok: data.ok === true,
        output: normalizeOutput((data.logs || []).join('\n')),
        error: data.error ? String(data.error) : '',
        mode: 'real'
      });
    };

    worker.onerror = (event) => {
      finish({
        ok: false,
        output: '',
        error: (event && event.message) || 'The JavaScript sandbox crashed.',
        mode: 'real'
      });
    };

    worker.postMessage({ code: String(code || '') });
  });
}

/*
 * Python runs inside a dedicated Web Worker. The runtime is loaded once from
 * the CDN and reused, but a runaway loop can be killed by terminating the
 * worker — the page itself never freezes.
 */
const PYTHON_WORKER_SOURCE = `importScripts(${JSON.stringify(PYODIDE_BASE + 'pyodide.js')});
let booting = null;
function boot() {
  if (!booting) booting = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_BASE)} });
  return booting;
}
function push(text, add) {
  const chunk = String(text === undefined || text === null ? '' : text);
  add(chunk);
}
self.onmessage = async (event) => {
  const data = event.data || {};
  const id = data.id;
  let stdout = '';
  let stderr = '';
  const NL = String.fromCharCode(10);
  const addOut = (chunk) => { stdout += chunk; if (!chunk.endsWith(NL)) stdout += NL; };
  const addErr = (chunk) => { stderr += chunk; if (!chunk.endsWith(NL)) stderr += NL; };
  try {
    const pyodide = await boot();
    pyodide.setStdout({ batched: (text) => push(text, addOut) });
    pyodide.setStderr({ batched: (text) => push(text, addErr) });
    let globals = null;
    try { globals = pyodide.toPy({ __name__: '__main__' }); } catch (error) { globals = null; }
    try {
      await pyodide.runPythonAsync(String(data.code === undefined ? '' : data.code), globals ? { globals } : undefined);
    } finally {
      if (globals && typeof globals.destroy === 'function') { try { globals.destroy(); } catch (error) { /* ignore */ } }
    }
    self.postMessage({ id, ok: true, stdout, stderr });
  } catch (error) {
    const message = String((error && (error.message || error.toString())) || error);
    const fatal = /importScripts|Failed to fetch|NetworkError|loadPyodide is not defined|Cannot read propert/i.test(message);
    self.postMessage({ id, ok: false, fatal, stdout, stderr, error: message });
  }
};`;

let pythonWorker = null;
let pythonJobId = 0;
const pythonJobs = new Map();

function stopPythonWorker(reason) {
  if (pythonWorker) {
    try {
      pythonWorker.terminate();
    } catch {
      /* ignore */
    }
  }
  pythonWorker = null;
  for (const [id, job] of pythonJobs.entries()) {
    clearTimeout(job.timer);
    job.reject(new Error(reason));
    pythonJobs.delete(id);
  }
}

function getPythonWorker() {
  if (pythonWorker) return pythonWorker;
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
    throw new Error('Web Workers are not available in this browser.');
  }
  const url = URL.createObjectURL(new Blob([PYTHON_WORKER_SOURCE], { type: 'text/javascript' }));
  const worker = new Worker(url);
  worker.onmessage = (event) => {
    const payload = event.data || {};
    const job = pythonJobs.get(payload.id);
    if (!job) return;
    clearTimeout(job.timer);
    pythonJobs.delete(payload.id);
    job.resolve(payload);
  };
  worker.onerror = (event) => {
    stopPythonWorker((event && event.message) || 'Python worker crashed.');
  };
  pythonWorker = worker;
  return worker;
}

/**
 * Execute Python with real CPython compiled to WebAssembly (Pyodide) inside a
 * worker that can be terminated, so `while True:` cannot freeze the page.
 * @returns {Promise<{ok: boolean, output: string, error: string, mode: 'real'|'unavailable', durationMs: number}>}
 */
export async function runPython(code) {
  const startedAt = now();

  let worker;
  try {
    worker = getPythonWorker();
  } catch (error) {
    return {
      ok: false,
      output: '',
      error: `Python engine unavailable — ${(error && error.message) || error}`,
      mode: 'unavailable',
      durationMs: elapsed(startedAt)
    };
  }

  const id = ++pythonJobId;
  const payload = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      stopPythonWorker(`Python timed out after ${PYTHON_TIMEOUT_MS / 1000}s and was stopped.`);
      reject(new Error(`Execution timed out after ${PYTHON_TIMEOUT_MS / 1000}s. Check for infinite loops.`));
    }, PYTHON_TIMEOUT_MS);
    pythonJobs.set(id, { resolve, reject, timer });
    worker.postMessage({ id, code: String(code || '') });
  }).catch((error) => ({
    ok: false,
    output: '',
    error: (error && error.message) || String(error)
  }));

  if (payload.fatal) {
    stopPythonWorker(payload.error || 'Python engine failed to load.');
    return {
      ok: false,
      output: normalizeOutput(payload.stdout || ''),
      error: `Python engine could not be loaded — check your connection. (${payload.error})`,
      mode: 'unavailable',
      durationMs: elapsed(startedAt)
    };
  }

  return {
    ok: Boolean(payload.ok) && normalizeOutput(payload.stderr || '') === '',
    output: normalizeOutput(payload.stdout || ''),
    error: normalizeOutput(payload.stderr || '') || (payload.ok ? '' : normalizeOutput(payload.error || '')),
    mode: 'real',
    durationMs: elapsed(startedAt)
  };
}

// Syllabus C++ stages after #5 ship bare snippets (no main/include). Wrap them
// so Piston can compile them while leaving complete programs untouched.
/** Headers auto-included when the learner uses the matching std type/function. */
const CPP_AUTO_HEADERS = [
  { header: 'vector', pattern: /\bstd::vector\b|\bvector\s*</ },
  { header: 'string', pattern: /\bstd::string\b|\bstring\s+[A-Za-z_]|\bgetline\s*\(/ },
  { header: 'map', pattern: /\bstd::map\b|\bmap\s*</ },
  { header: 'unordered_map', pattern: /\bunordered_map\s*</ },
  { header: 'set', pattern: /\bstd::set\b|\bset\s*</ },
  { header: 'memory', pattern: /\b(unique_ptr|shared_ptr|make_unique|make_shared)\b/ },
  { header: 'algorithm', pattern: /\b(sort|find|max_element|min_element|reverse)\s*\(/ },
  { header: 'cmath', pattern: /\b(sqrt|pow|abs|floor|ceil|round)\s*\(/ },
  { header: 'sstream', pattern: /\b(stringstream|ostringstream|istringstream)\b/ },
];

export function prepareCppSource(code) {
  const source = String(code || '');
  const hasMain = /\bint\s+main\s*\(/.test(source);
  const hasUsingNamespace = /using\s+namespace\s+std\s*;/.test(source);
  const hasInclude = (header) => new RegExp(`#include\\s*<${header}>`).test(source);

  const prelude = [];
  if (!hasInclude('iostream')) prelude.push('#include <iostream>');
  for (const { header, pattern } of CPP_AUTO_HEADERS) {
    if (pattern.test(source) && !hasInclude(header)) prelude.push(`#include <${header}>`);
  }
  if (!hasUsingNamespace) prelude.push('using namespace std;');

  const header = prelude.join('\n');
  if (hasMain) {
    return header ? `${header}\n${source}` : source;
  }
  return `${header}\n\nint main() {\n${source}\nreturn 0;\n}\n`;
}

/**
 * Compile & run C++ through the public Piston API.
 * @returns {Promise<{ok: boolean, output: string, error: string, mode: 'real'|'unavailable', durationMs: number}>}
 */
/** Normalize a Piston response into the evaluator result shape. */
export function interpretPistonResult(data) {
  const compile = (data && data.compile) || {};
  const run = (data && data.run) || {};
  const compileFailed = typeof compile.code === 'number' && compile.code !== 0;
  const compileError = normalizeOutput(compile.stderr || (compile.code ? compile.output : ''));
  const runtimeError = normalizeOutput(run.stderr);
  const exitCode = typeof run.code === 'number' ? run.code : 0;
  return {
    ok: !compileFailed && exitCode === 0 && runtimeError === '',
    output: normalizeOutput(run.stdout),
    error: compileError || runtimeError
  };
}

/** Normalize a Wandbox response into the evaluator result shape. */
export function interpretWandboxResult(data) {
  const status = data && data.status;
  const compileError = normalizeOutput(data && data.compiler_error);
  const programOutput = normalizeOutput(data && data.program_output);
  const programError = normalizeOutput(data && data.program_error);
  const failed = compileError !== '' || programError !== '' || (status !== undefined && String(status) !== '0');
  return {
    ok: !failed,
    output: programOutput,
    error: compileError || programError || (failed ? normalizeOutput((data && data.signal) || 'Compiler error') : '')
  };
}

async function postJson(url, body, headers, timeoutMs) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      signal: controller ? controller.signal : undefined,
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

async function runCppOnPiston(source, timeoutMs) {
  const headers = PISTON_API_KEY ? { Authorization: `Bearer ${PISTON_API_KEY}` } : {};
  const data = await postJson(PISTON_URL, {
    language: 'c++',
    version: PISTON_VERSION,
    files: [{ name: 'main.cpp', content: source }]
  }, headers, timeoutMs);
  return interpretPistonResult(data);
}

async function runCppOnWandbox(source, timeoutMs) {
  const data = await postJson(WANDBOX_URL, {
    compiler: WANDBOX_COMPILER,
    code: source,
    'compiler-option-raw': '-std=c++17',
    stdin: ''
  }, {}, timeoutMs);
  return interpretWandboxResult(data);
}

const CPP_PROVIDERS = PISTON_API_KEY
  ? [['Piston', runCppOnPiston], ['Wandbox', runCppOnWandbox]]
  : [['Wandbox', runCppOnWandbox], ['Piston', runCppOnPiston]];

export async function runCpp(code) {
  const startedAt = now();
  const source = prepareCppSource(code);
  const failures = [];

  for (const [name, runner] of CPP_PROVIDERS) {
    try {
      const result = await runner(source, CPP_PROVIDER_TIMEOUT_MS);
      if (result.error && !result.output && /^(HTTP|Failed to fetch|NetworkError)/.test(result.error)) {
        failures.push(`${name}: ${result.error}`);
        continue;
      }
      return {
        ok: result.ok,
        output: result.output,
        error: result.error,
        mode: 'real',
        durationMs: elapsed(startedAt)
      };
    } catch (error) {
      const aborted = error && error.name === 'AbortError';
      failures.push(`${name}: ${aborted ? 'timed out' : (error && error.message) || error}`);
    }
  }

  return {
    ok: false,
    output: '',
    error: `C++ engine unavailable — ${failures.join('; ')}`,
    mode: 'unavailable',
    durationMs: elapsed(startedAt)
  };
}

/**
 * Last-resort verification when no remote engine answers. It can never confirm
 * real behaviour, so it only passes when the source satisfies the stage pattern
 * AND literally contains the expected output (i.e. the learner knows the answer).
 * Everything else stays failed and surfaces FALLBACK_NOTICE instead of a free win.
 */
export function staticCheck(stage, code) {
  if (!stage) return false;
  const source = String(code || '');
  if (!safeRegexTest(stage.regexMatch, source)) return false;
  const expected = normalizeOutput(stage.expectedOutput).replace(/\s+/g, ' ').trim();
  if (!expected) return false;
  return source.replace(/\s+/g, ' ').includes(expected);
}

const RUNNERS = {
  javascript: runJavaScript,
  python: runPython,
  cpp: runCpp
};

/**
 * Execute a stage's code and validate it against the syllabus.
 * Passing requires the real program output to match `expectedOutput`;
 * `regexMatch` is only ever an additional requirement, never the sole reason.
 *
 * @param {{trackId: string, stage: object, code: string, entropy?: object}} params
 * @returns {Promise<{passed: boolean, output: string, error: string, mode: 'real'|'fallback', durationMs: number, notice?: string, entropy?: object}>}
 */
export function hasRunner(trackId) {
  return Boolean(RUNNERS[trackId]);
}

export async function evaluateStage({ trackId, stage, code, entropy } = {}) {
  const startedAt = now();

  if (!stage) {
    return {
      passed: false,
      output: '',
      error: 'No stage selected.',
      mode: 'fallback',
      durationMs: 0,
      notice: FALLBACK_NOTICE,
      entropy
    };
  }

  const runner = RUNNERS[trackId];
  if (!runner) {
    return {
      passed: false,
      output: '',
      error: `No execution engine is configured for "${trackId}".`,
      mode: 'fallback',
      durationMs: elapsed(startedAt),
      notice: FALLBACK_NOTICE,
      entropy
    };
  }

  let result;
  try {
    result = await runner(String(code || ''));
  } catch (error) {
    result = {
      ok: false,
      output: '',
      error: (error && (error.message || error.toString())) || String(error),
      mode: 'unavailable'
    };
  }

  const durationMs = typeof result.durationMs === 'number' ? result.durationMs : elapsed(startedAt);

  if (result.mode === 'unavailable') {
    const passed = staticCheck(stage, code);
    return {
      passed,
      output: '',
      error: result.error || '',
      mode: 'fallback',
      durationMs,
      notice: FALLBACK_NOTICE,
      entropy
    };
  }

  const outputMatches = matchesExpected(result.output, stage.expectedOutput);
  // Secondary check: the pattern may describe the source or the printed text
  // (e.g. C++ stage 3 prints "Attack: 35" without that literal in the source).
  // It can never grant a pass on its own — output equality is required too.
  const regexSatisfied = safeRegexTest(stage.regexMatch, `${code}\n${result.output || ''}`);
  // A crash/timeout must fail the stage even if some output leaked out first.
  const runtimeClean = result.ok !== false;

  return {
    passed: outputMatches && regexSatisfied && runtimeClean,
    output: result.output || '',
    error: result.error || '',
    mode: 'real',
    durationMs,
    entropy
  };
}
