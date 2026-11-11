// Real code execution for PixelCoder.
// - JavaScript: sandboxed Web Worker created from a Blob (no DOM access), 5s hard timeout.
// - Python: real CPython via Pyodide, lazily loaded from CDN and reused.
// - C++: Piston public execution API, 10s timeout.
// No npm dependencies are used.

export const JS_TIMEOUT_MS = 5000;
export const PYTHON_TIMEOUT_MS = 20000;
export const CPP_TIMEOUT_MS = 10000;

const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

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

let pyodideReady = null;

function loadPyodideEngine() {
  if (pyodideReady) return pyodideReady;

  const loading = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('No document available to load Pyodide.'));
      return;
    }

    const boot = () => {
      if (typeof window === 'undefined' || typeof window.loadPyodide !== 'function') {
        reject(new Error('Pyodide loader did not initialise.'));
        return;
      }
      window.loadPyodide({ indexURL: PYODIDE_BASE }).then(resolve, reject);
    };

    if (typeof window !== 'undefined' && typeof window.loadPyodide === 'function') {
      boot();
      return;
    }

    const existing = document.querySelector('script[data-pixelcoder-pyodide]');
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        boot();
        return;
      }
      existing.addEventListener('load', boot, { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Pyodide CDN script failed to load.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `${PYODIDE_BASE}pyodide.js`;
    script.async = true;
    script.dataset.pixelcoderPyodide = 'true';
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      boot();
    }, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Pyodide CDN script failed to load.')),
      { once: true }
    );
    document.head.appendChild(script);
  });

  pyodideReady = loading.catch((error) => {
    pyodideReady = null;
    throw error;
  });

  return pyodideReady;
}

function withTimeout(promise, ms, message) {
  let timer = null;
  const guard = new Promise((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, guard]).finally(() => {
    if (timer !== null) clearTimeout(timer);
  });
}

/**
 * Execute Python with real CPython compiled to WebAssembly (Pyodide).
 * The runtime is loaded once from the CDN and reused for later runs.
 * @returns {Promise<{ok: boolean, output: string, error: string, mode: 'real'|'unavailable', durationMs: number}>}
 */
export async function runPython(code) {
  const startedAt = now();
  let pyodide = null;

  try {
    pyodide = await loadPyodideEngine();
  } catch (error) {
    return {
      ok: false,
      output: '',
      error: `Python engine could not be loaded — check your connection or offline status. (${(error && error.message) || error})`,
      mode: 'unavailable',
      durationMs: elapsed(startedAt)
    };
  }

  let stdout = '';
  let stderr = '';
  let globals = null;

  try {
    pyodide.setStdout({
      batched: (text) => {
        const chunk = String(text === undefined || text === null ? '' : text);
        stdout += chunk.endsWith('\n') ? chunk : `${chunk}\n`;
      }
    });
    pyodide.setStderr({
      batched: (text) => {
        const chunk = String(text === undefined || text === null ? '' : text);
        stderr += chunk.endsWith('\n') ? chunk : `${chunk}\n`;
      }
    });

    // Fresh namespace per run so stages cannot leak variables into each other.
    try {
      if (typeof pyodide.toPy === 'function') {
        globals = pyodide.toPy({ __name__: '__main__' });
      }
    } catch {
      globals = null;
    }

    await withTimeout(
      pyodide.runPythonAsync(String(code || ''), globals ? { globals } : undefined),
      PYTHON_TIMEOUT_MS,
      `Execution timed out after ${PYTHON_TIMEOUT_MS / 1000}s. Check for infinite loops.`
    );

    return {
      ok: normalizeOutput(stderr) === '',
      output: normalizeOutput(stdout),
      error: normalizeOutput(stderr),
      mode: 'real',
      durationMs: elapsed(startedAt)
    };
  } catch (error) {
    const message = (error && (error.message || error.toString())) || String(error);
    return {
      ok: false,
      output: normalizeOutput(stdout),
      error: normalizeOutput(stderr) || message,
      mode: 'real',
      durationMs: elapsed(startedAt)
    };
  } finally {
    if (globals && typeof globals.destroy === 'function') {
      try {
        globals.destroy();
      } catch {
        // ignore proxy cleanup failures
      }
    }
  }
}

// Syllabus C++ stages after #5 ship bare snippets (no main/include). Wrap them
// so Piston can compile them while leaving complete programs untouched.
export function prepareCppSource(code) {
  const source = String(code || '');
  const hasMain = /\bint\s+main\s*\(/.test(source);
  const hasIostream = /#include\s*<iostream>/.test(source);
  const hasUsingNamespace = /using\s+namespace\s+std\s*;/.test(source);
  const hasVector = /std::vector|<vector>/.test(source);

  const prelude = [];
  if (!hasIostream) prelude.push('#include <iostream>');
  if (hasVector && !/#include\s*<vector>/.test(source)) prelude.push('#include <vector>');
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
export async function runCpp(code) {
  const startedAt = now();
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), CPP_TIMEOUT_MS)
    : null;

  try {
    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller ? controller.signal : undefined,
      body: JSON.stringify({
        language: 'c++',
        version: '*',
        files: [{ name: 'main.cpp', content: prepareCppSource(code) }]
      })
    });

    if (!response.ok) {
      throw new Error(`Piston responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const compile = data && data.compile ? data.compile : {};
    const run = data && data.run ? data.run : {};
    const compileError = normalizeOutput(compile.stderr || (compile.code ? compile.output : ''));
    const runtimeError = normalizeOutput(run.stderr);
    const output = normalizeOutput(run.stdout);
    const exitCode = typeof run.code === 'number' ? run.code : 0;
    const compileFailed = typeof compile.code === 'number' && compile.code !== 0;
    const ok = !compileFailed && exitCode === 0 && runtimeError === '';

    return {
      ok,
      output,
      error: compileError || runtimeError,
      mode: 'real',
      durationMs: elapsed(startedAt)
    };
  } catch (error) {
    const aborted = error && error.name === 'AbortError';
    return {
      ok: false,
      output: '',
      error: aborted
        ? `C++ engine timed out after ${CPP_TIMEOUT_MS / 1000}s.`
        : `C++ engine unavailable — Piston could not be reached. (${(error && error.message) || error})`,
      mode: 'unavailable',
      durationMs: elapsed(startedAt)
    };
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

const RUNNERS = {
  javascript: runJavaScript,
  python: runPython,
  cpp: runCpp
};

function staticCheck(stage, code) {
  const expectedSolution = normalizeOutput(stage.solution || '');
  if (!expectedSolution) return false;

  const normalizedCode = normalizeOutput(code).replace(/\s+/g, '');
  const normalizedSolution = expectedSolution.replace(/\s+/g, '');
  if (!normalizedCode.includes(normalizedSolution)) return false;

  // Mirror real mode: the pattern may describe the source or the expected text.
  return safeRegexTest(stage.regexMatch, `${code}\n${stage.expectedOutput || ''}`);
}

/**
 * Execute a stage's code and validate it against the syllabus.
 * Passing requires the real program output to match `expectedOutput`;
 * `regexMatch` is only ever an additional requirement, never the sole reason.
 *
 * @param {{trackId: string, stage: object, code: string, entropy?: object}} params
 * @returns {Promise<{passed: boolean, output: string, error: string, mode: 'real'|'fallback', durationMs: number, notice?: string, entropy?: object}>}
 */
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
