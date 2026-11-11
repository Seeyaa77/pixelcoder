import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Code2,
  Send,
  Loader2,
  Clock,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PixelCoinIcon } from './Icons';
import { getTranslation, getHintCost } from '../data/translations';
import { evaluateStage } from '../lib/evaluator';

export default function CodePlayground({
  stage,
  trackId,
  language = 'en',
  playerGold = 0,
  hintUnlocked = false,
  onBuyHint,
  onStageClear,
  onStageFailed,
  isCleared,
  onNextStage,
  hasNextStage,
  onCombatTrigger
}) {
  const labels = language === 'en'
    ? {
        theory: 'Theory & Syllabus',
        objective: 'Stage Objective',
        expected: 'Expected:',
        run: 'Run Code',
        submit: 'Submit',
        running: 'Executing…',
        reset: 'Reset',
        editorTitle: 'combat_script_editor',
        idleHint: 'Write code above, then "Run Code" to test it or "Submit" to attack the monster!',
        cleared: 'STAGE CLEARED',
        failed: 'TESTS FAILED',
        emptyCode: 'No code to run yet. Write a solution in the editor first.',
        battleLog: 'Battle Log & Test Output',
        realMode: 'REAL EXECUTION',
        staticMode: 'STATIC CHECK ONLY',
        engine: 'Engine: JavaScript runs in an isolated worker (5s limit), Python via Pyodide (CDN), C++ via Piston (network).',
        nextStage: 'Next Dungeon ❯',
        hint: 'Hint',
        hide: 'Hide',
        hintLabel: '💡 Hint:',
        notEnoughGold: 'Not enough gold!',
        stderrLabel: 'stderr',
        keystrokes: 'Keystrokes'
      }
    : {
        theory: 'Teori & Silabus',
        objective: 'Tujuan Stage',
        expected: 'Output:',
        run: 'Jalankan Kode',
        submit: 'Kumpulkan',
        running: 'Menjalankan…',
        reset: 'Reset',
        editorTitle: 'combat_script_editor',
        idleHint: 'Tulis kode di atas, lalu "Jalankan Kode" untuk menguji atau "Kumpulkan" untuk menyerang monster!',
        cleared: 'STAGE SELESAI',
        failed: 'TES GAGAL',
        emptyCode: 'Belum ada kode untuk dijalankan. Tulis solusi di editor terlebih dahulu.',
        battleLog: 'Log Pertarungan & Output Tes',
        realMode: 'EKSEKUSI NYATA',
        staticMode: 'CEK STATIS',
        engine: 'Mesin: JavaScript berjalan di worker terisolasi (batas 5 detik), Python via Pyodide (CDN), C++ via Piston (jaringan).',
        nextStage: 'Dungeon Berikutnya ❯',
        hint: 'Petunjuk',
        hide: 'Tutup',
        hintLabel: '💡 Petunjuk:',
        notEnoughGold: 'Gold tidak cukup!',
        stderrLabel: 'stderr',
        keystrokes: 'Ketukan'
      };

  const [code, setCode] = useState(stage.starterCode || '');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [phase, setPhase] = useState(isCleared ? 'passed' : 'idle');
  const [mode, setMode] = useState(null);
  const [durationMs, setDurationMs] = useState(null);
  const [notice, setNotice] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [boughtForStage, setBoughtForStage] = useState(null);
  const [keystrokes, setKeystrokes] = useState(0);

  // Mount timestamp captured once via a lazy initializer (no impure call in render).
  const [mountTime] = useState(() => Date.now());

  // Reset editor state when the stage changes (render-time adjustment, no effect).
  const stageKey = `${trackId}:${stage.stageNumber}`;
  const [activeStageKey, setActiveStageKey] = useState(stageKey);
  if (activeStageKey !== stageKey) {
    setActiveStageKey(stageKey);
    setCode(stage.starterCode || '');
    setStdout('');
    setStderr('');
    setPhase(isCleared ? 'passed' : 'idle');
    setMode(null);
    setDurationMs(null);
    setNotice('');
    setShowHint(false);
    setBoughtForStage(null);
    setKeystrokes(0);
  }

  const hintBought = hintUnlocked || boughtForStage === stageKey;

  const hintCost = getHintCost(stage.stageNumber);
  // English comes from the syllabus (single source of truth); Indonesian uses
  // the translation table with the syllabus question as fallback.
  const translatedQuestion = language === 'id'
    ? getTranslation(trackId, stage.stageNumber, 'question', 'id') || stage.question
    : stage.question;
  const translatedHint = getTranslation(trackId, stage.stageNumber, 'hint', language);
  const isRunning = phase === 'running';
  const linesCount = Math.max(7, code.split('\n').length);
  const expectedOutput = stage.expectedOutput || '';

  const handleCodeChange = (event) => {
    setCode(event.target.value);
    setKeystrokes((prev) => prev + 1);
  };

  const handleReset = () => {
    setCode(stage.starterCode || '');
    setStdout('');
    setStderr('');
    setPhase('idle');
    setMode(null);
    setDurationMs(null);
    setNotice('');
  };

  const execute = async (shouldSubmit) => {
    if (isRunning) return;

    if (!code.trim()) {
      setStdout('');
      setStderr(labels.emptyCode);
      setMode(null);
      setDurationMs(null);
      setNotice('');
      setPhase('idle');
      return;
    }

    setPhase('running');
    setStdout('');
    setStderr('');
    setNotice('');
    setMode(null);
    setDurationMs(null);

    const entropy = {
      keystrokes,
      codeLength: code.length,
      elapsedMs: Date.now() - mountTime
    };

    let result;
    try {
      result = await evaluateStage({ trackId, stage, code, entropy });
    } catch (error) {
      result = {
        passed: false,
        output: '',
        error: (error && error.message) || 'Unknown execution error.',
        mode: 'fallback',
        durationMs: 0,
        notice: 'Execution engine unavailable — static check only'
      };
    }

    setStdout(result.output || '');
    setStderr(result.error || '');
    setMode(result.mode || null);
    setDurationMs(typeof result.durationMs === 'number' ? result.durationMs : null);
    setNotice(result.notice || '');

    if (!shouldSubmit) {
      setPhase('idle');
      return;
    }

    if (result.passed) {
      setPhase('passed');

      if (onCombatTrigger) {
        onCombatTrigger('player_attack');
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#7D8D39', '#F59E0B', '#1E2522']
      });

      if (onStageClear) {
        onStageClear(stage.stageNumber, stage.xp, {
          duration_ms: result.durationMs,
          keystrokes,
          codeLength: code.length
        });
      }
    } else {
      setPhase('failed');

      if (onCombatTrigger) {
        onCombatTrigger('monster_attack');
      }
      if (onStageFailed) {
        onStageFailed();
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Top Section: Theory & Task Problem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Theory & Syllabus Card */}
        <div className="neo-box p-3.5 bg-white flex flex-col">
          <div className="flex items-center gap-2 pb-1.5 mb-2 border-b-2 border-[#1E2522]">
            <BookOpen className="w-4 h-4 text-[#7D8D39]" />
            <h3 className="font-extrabold text-xs uppercase text-[#1E2522]">
              {labels.theory}
            </h3>
            {stage.concept && (
              <span className="ml-auto font-mono text-[10px] bg-[#E7EEDB] px-1.5 py-0.2 border border-[#1E2522] text-[#586526] font-bold">
                {stage.concept}
              </span>
            )}
          </div>

          <div className="font-mono text-xs whitespace-pre-line text-[#1E2522] leading-relaxed bg-[#F3F6F4] p-2.5 border-2 border-[#1E2522] max-h-40 overflow-y-auto">
            {stage.theory?.[language] || stage.theory?.en || stage.theory || ''}
          </div>
        </div>

        {/* Task Challenge Card */}
        <div className="neo-box p-3.5 bg-[#FEFDF9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-[#1E2522]">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#D97706]" />
                <h4 className="font-extrabold text-xs uppercase text-[#1E2522]">
                  {labels.objective}
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-[#FEF3C7] border border-[#1E2522] text-[#B45309]">
                  +{stage.xp} XP
                </span>
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-[#FEF08A] border border-[#1E2522] text-[#854D0E] flex items-center gap-1">
                  <PixelCoinIcon className="w-3 h-3" />
                  <span>50</span>
                </span>
              </div>
            </div>

            <p className="text-xs font-medium text-[#1E2522] leading-relaxed mb-2">
              {translatedQuestion}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <div className="bg-[#E7EEDB] border border-[#1E2522] px-2 py-1 font-mono text-[11px] text-[#586526] font-bold flex items-center gap-1">
              <span>{labels.expected}</span>
              <span className="text-[#1E2522] font-mono">{expectedOutput.replace(/\n/g, ' ')}</span>
            </div>

            {!hintBought && translatedHint ? (
              <button
                onClick={() => {
                  if (playerGold >= hintCost && onBuyHint) {
                    setBoughtForStage(stageKey);
                    setShowHint(true);
                    onBuyHint(hintCost);
                  }
                }}
                disabled={playerGold < hintCost}
                className={`text-[11px] font-mono font-bold flex items-center gap-1 px-2 py-1 border border-[#1E2522] ${
                  playerGold >= hintCost
                    ? 'bg-[#FEF08A] text-[#854D0E] hover:bg-[#FDE047] cursor-pointer'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                title={playerGold < hintCost ? labels.notEnoughGold : ''}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <PixelCoinIcon className="w-3 h-3" />
                <span>{hintCost}</span>
              </button>
            ) : hintBought ? (
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] font-mono font-bold text-[#10B981] flex items-center gap-1 hover:underline"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? labels.hide : labels.hint}</span>
              </button>
            ) : null}
          </div>

          {showHint && hintBought && translatedHint && (
            <div className="mt-2 bg-[#FEF9C3] p-2 border-2 border-[#1E2522] font-mono text-[11px] text-[#713F12]">
              <strong>{labels.hintLabel}</strong>
              <p className="mt-1 text-[10px] leading-relaxed">
                {translatedHint}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Code Editor & Execution Console */}
      <div className="flex flex-col gap-3">

        {/* Editor Box */}
        <div className="neo-box bg-[#1E2522] text-white overflow-hidden">

          {/* Header Bar */}
          <div className="bg-[#151B18] px-3.5 py-2 flex items-center justify-between border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-full inline-block"></span>
              <span className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full inline-block"></span>
              <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full inline-block"></span>
              <span className="font-mono text-xs text-gray-300 ml-2">{labels.editorTitle}</span>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] font-mono text-gray-400 hover:text-white flex items-center gap-1 px-2 py-0.5 border border-gray-600 rounded"
              title={labels.reset}
            >
              <RotateCcw className="w-3 h-3" />
              {labels.reset}
            </button>
          </div>

          {/* Textarea with Line Numbers */}
          <div className="flex bg-[#1E2522]">
            <div className="py-2.5 px-2 font-mono text-xs text-gray-500 select-none text-right bg-[#181E1B] border-r border-gray-800">
              {Array.from({ length: linesCount }, (_, i) => (
                <div key={i} className="leading-6">{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={handleCodeChange}
              spellCheck="false"
              className="w-full h-44 p-2.5 bg-transparent text-[#E2E8F0] font-mono text-xs leading-6 outline-none resize-none"
              placeholder="// Write your code solution here to attack the monster..."
            />
          </div>

          {/* Action Footer */}
          <div className="bg-[#151B18] p-2.5 border-t-2 border-black flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span>{labels.keystrokes}: {keystrokes}</span>
              <span>•</span>
              <span className={mode === 'fallback' ? 'text-[#F59E0B]' : 'text-[#10B981]'}>
                {mode ? (mode === 'real' ? labels.realMode : labels.staticMode) : 'Combat Engine Ready'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => execute(false)}
                disabled={isRunning}
                className={`neo-button text-xs py-1.5 px-4 gap-1.5 flex items-center bg-[#3F4A3F] hover:bg-[#4B584B] ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
                title={labels.run}
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                <span>{isRunning ? labels.running : labels.run}</span>
              </button>

              <button
                onClick={() => execute(true)}
                disabled={isRunning}
                className={`neo-button text-xs py-1.5 px-4 gap-1.5 flex items-center bg-[#7D8D39] hover:bg-[#8fa042] ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
                title={labels.submit}
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isRunning ? labels.running : labels.submit}</span>
              </button>

              {phase === 'passed' && hasNextStage && (
                <button
                  onClick={onNextStage}
                  className="neo-button text-xs py-1.5 px-3.5 gap-1 flex items-center bg-[#F59E0B] text-black border-black hover:bg-[#fbbf24]"
                >
                  <span>{labels.nextStage}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Output Console Box */}
        <div className="neo-box p-3 bg-white">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b-2 border-[#1E2522]">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-[#1E2522]">
              <span className="w-2 h-2 bg-[#7D8D39] inline-block"></span>
              <span>{labels.battleLog}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {phase === 'passed' && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#586526] bg-[#E7EEDB] px-1.5 py-0.2 border border-[#1E2522]">
                  <CheckCircle2 className="w-3 h-3" />
                  {labels.cleared}
                </span>
              )}
              {phase === 'failed' && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.2 border border-[#1E2522]">
                  <AlertCircle className="w-3 h-3" />
                  {labels.failed}
                </span>
              )}
              {mode && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 border border-[#1E2522] ${
                    mode === 'real' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF3C7] text-[#B45309]'
                  }`}
                >
                  {mode === 'real' ? labels.realMode : labels.staticMode}
                </span>
              )}
              {durationMs !== null && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-gray-600">
                  <Clock className="w-3 h-3" />
                  {durationMs}ms
                </span>
              )}
            </div>
          </div>

          <div className="font-mono text-xs bg-[#1E2522] text-[#A7F3D0] p-2.5 border-2 border-[#1E2522] min-h-[64px] max-h-40 overflow-y-auto whitespace-pre-wrap">
            {stdout && <pre className="whitespace-pre-wrap break-words m-0">{stdout}</pre>}
            {stderr && (
              <pre className="whitespace-pre-wrap break-words m-0 text-[#FCA5A5]">
                <span className="text-gray-500">[{labels.stderrLabel}] </span>
                {stderr}
              </pre>
            )}
            {!stdout && !stderr && (
              <span className="text-gray-500 italic">
                {isRunning ? labels.running : labels.idleHint}
              </span>
            )}
          </div>

          {notice && (
            <div className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-[#B45309]">
              <Terminal className="w-3 h-3" />
              <span>{notice}</span>
            </div>
          )}

          <p className="mt-1.5 font-mono text-[10px] text-gray-500">
            {labels.engine}
          </p>
        </div>

      </div>

    </div>
  );
}
