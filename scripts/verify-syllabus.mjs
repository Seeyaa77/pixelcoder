#!/usr/bin/env node
/**
 * Curriculum verifier for src/data/syllabus.js.
 *
 * For every stage it:
 *  1. checks the data shape (required fields, unique numbers, bilingual theory)
 *  2. rejects "trivial" stages whose whole solution is a literal print of the
 *     expected output (the original 18 stages did exactly that)
 *  3. actually executes the reference solution and compares stdout with
 *     `expectedOutput` (JS in a DOM-less vm context that mimics the Web
 *     Worker sandbox, Python via python, C++ via g++ -std=c++17)
 *
 * Usage: node scripts/verify-syllabus.mjs [--only=auth,gold]
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import vm from 'node:vm'

import { SYLLABUS_TRACKS } from '../src/data/syllabus.js'
import { prepareCppSource } from '../src/lib/evaluator.js'

const REQUIRED = ['stageNumber', 'title', 'xp', 'concept', 'theory', 'taskType', 'question', 'starterCode', 'solution', 'expectedOutput']
const TRACKS = Object.keys(SYLLABUS_TRACKS)
const work = mkdtempSync(join(tmpdir(), 'pc-syllabus-'))

const normalize = (value) =>
  String(value ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n+$/g, '')

async function runJavaScript(code) {
  const chunks = []
  const fakeConsole = {
    log: (...args) => chunks.push(args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ')),
    error: (...args) => chunks.push(args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ')),
    warn: () => {},
    info: (...args) => chunks.push(args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ')),
  }
  // Mirrors the Blob Worker sandbox: no document, window, localStorage, fetch.
  const context = vm.createContext({ console: fakeConsole, setTimeout, clearTimeout })
  try {
    new vm.Script(code, { filename: 'solution.js' }).runInContext(context, { timeout: 5000 })
  } catch (error) {
    return { ok: false, output: normalize(chunks.join('\n')), error: error.message }
  }
  // Let resolved promises / async functions log before we read the buffer.
  await new Promise((resolve) => setTimeout(resolve, 25))
  return { ok: true, output: normalize(chunks.join('\n')), error: '' }
}

function runPython(code) {
  const file = join(work, `solution-${Math.random().toString(36).slice(2)}.py`)
  writeFileSync(file, code, 'utf8')
  const res = spawnSync('python', [file], { encoding: 'utf8', timeout: 20000 })
  if (res.error) return { ok: false, output: '', error: res.error.message }
  return { ok: res.status === 0, output: normalize(res.stdout), error: normalize(res.stderr) }
}

function runCpp(code) {
  const id = Math.random().toString(36).slice(2)
  const source = join(work, `main-${id}.cpp`)
  const exe = join(work, `main-${id}.exe`)
  writeFileSync(source, prepareCppSource(code), 'utf8')

  const compile = spawnSync('g++', ['-std=c++17', '-O0', source, '-o', exe], { encoding: 'utf8', timeout: 40000 })
  if (compile.status !== 0) return { ok: false, output: '', error: normalize(compile.stderr) || 'compile failed' }
  const run = spawnSync(exe, [], { encoding: 'utf8', timeout: 20000 })
  if (run.error) return { ok: false, output: '', error: run.error.message }
  return { ok: run.status === 0, output: normalize(run.stdout), error: normalize(run.stderr) }
}

const literalOnly = (stage, track) => {
  const solution = stage.solution.trim()
  const expected = normalize(stage.expectedOutput)
  if (track === 'cpp') {
    const onlyCout = /^cout\s*<<\s*"[^"]*"\s*;?$/.test(solution) || /^cout\s*<<\s*[0-9.]+\s*;?$/.test(solution)
    return onlyCout && normalize(solution.replace(/^cout\s*<<\s*|;$/g, '').replace(/^"|"$/g, '')) === expected
  }
  if (track === 'javascript') {
    return /^console\.log\(\s*(["'`])[^"'`]*\1\s*\)\s*;?$/.test(solution) && normalize(solution.replace(/^console\.log\(\s*(["'`])|(["'`])\s*\)\s*;?$/g, '')) === expected
  }
  if (track === 'python') {
    return /^print\(\s*(["'])[^"']*\1\s*\)\s*$/.test(solution) && normalize(solution.replace(/^print\(\s*(["'])|(["'])\s*\)\s*$/g, '')) === expected
  }
  return false
}

const failures = []
const results = []

for (const track of TRACKS) {
  const { stages = [] } = SYLLABUS_TRACKS[track] || {}
  const numbers = new Set()
  for (const stage of stages) {
    const id = `${track}:${stage.stageNumber}`
    const errors = []

    for (const key of REQUIRED) {
      if (stage[key] === undefined || stage[key] === null) errors.push(`missing ${key}`)
      else if (key !== 'starterCode' && key !== 'theory' && String(stage[key]).trim() === '') errors.push(`empty ${key}`)
    }
    if (typeof stage.starterCode !== 'string') errors.push('starterCode must be a string (may be empty)')
    if (numbers.has(stage.stageNumber)) errors.push('duplicate stageNumber')
    numbers.add(stage.stageNumber)
    if (!stage.theory?.en || !stage.theory?.id) errors.push('theory needs en + id')
    if (typeof stage.xp !== 'number' || stage.xp <= 0) errors.push('xp must be a positive number')
    if (stage.starterCode && stage.starterCode.trim() === stage.solution.trim()) errors.push('starterCode reveals the solution')
    try {
      new RegExp(stage.regexMatch) // eslint-disable-line no-new
    } catch {
      errors.push('regexMatch is not a valid regex')
    }
    if (literalOnly(stage, track)) errors.push('trivial stage: solution only prints the expected literal')

    let run = { ok: false, output: '', error: 'not executed' }
    if (stage.solution) {
      if (track === 'python') run = runPython(stage.solution)
      else if (track === 'cpp') run = runCpp(stage.solution)
      else run = await runJavaScript(stage.solution)
      if (!run.ok) errors.push(`solution failed to run: ${run.error.split('\n')[0]}`)
      else if (normalize(run.output) !== normalize(stage.expectedOutput)) {
        errors.push(`output mismatch | got=${JSON.stringify(normalize(run.output))} want=${JSON.stringify(normalize(stage.expectedOutput))}`)
      }
    }

    results.push({ id, title: stage.title, ok: errors.length === 0, errors, output: run.output })
    if (errors.length) failures.push({ id, title: stage.title, errors })
  }
  const expected = Array.from({ length: 15 }, (_, i) => i + 1)
  if (stages.length !== 15) failures.push({ id: `${track}:count`, errors: [`expected 15 stages, found ${stages.length}`] })
  const missing = expected.filter((n) => !numbers.has(n))
  if (missing.length) failures.push({ id: `${track}:numbers`, errors: [`missing stage numbers ${missing.join(', ')}`] })
}

if (process.argv.includes('--verbose')) {
  for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.id} ${r.title}`)
}

console.log(`\nChecked ${results.length} stages across ${TRACKS.length} tracks.`)
if (failures.length === 0) {
  console.log('All stages are well-formed and every reference solution produces its expectedOutput.')
  process.exit(0)
}

console.log(`\n${failures.length} problem stage(s):`)
for (const failure of failures) {
  console.log(`- ${failure.id} ${failure.title || ''}`)
  for (const error of failure.errors) console.log(`    ${error}`)
}
writeFileSync(join(work, 'report.json'), JSON.stringify({ failures, results }, null, 2))
console.log(`\nFull report: ${join(work, 'report.json')}`)
process.exit(1)
