import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Lightbulb, CheckCircle2, AlertCircle, BookOpen, Code2, Sword } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PixelCoinIcon } from './Icons';

export default function CodePlayground({ 
  stage, 
  onStageClear, 
  onStageFailed,
  isCleared,
  onNextStage,
  hasNextStage,
  onCombatTrigger
}) {
  const [code, setCode] = useState(stage.starterCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState(isCleared ? 'cleared' : 'idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [mountTime] = useState(Date.now());
  const [keystrokes, setKeystrokes] = useState(0);

  useEffect(() => {
    setCode(stage.starterCode || '');
    setOutput('');
    setStatus(isCleared ? 'cleared' : 'idle');
    setErrorMessage('');
    setShowHint(false);
    setKeystrokes(0);
  }, [stage, isCleared]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setKeystrokes(prev => prev + 1);
  };

  const runEvaluation = () => {
    setIsRunning(true);
    setStatus('idle');
    setErrorMessage('');

    const elapsedMs = Date.now() - mountTime;

    setTimeout(() => {
      let simOutput = '';
      let passed = false;

      try {
        if (stage.regexMatch) {
          const re = new RegExp(stage.regexMatch);
          passed = re.test(code);
        } else {
          passed = code.replace(/\s+/g, '').includes(stage.solution.replace(/\s+/g, ''));
        }

        if (passed) {
          simOutput = stage.expectedOutput;
          setStatus('cleared');
          setOutput(simOutput);

          // Trigger Player Slash & Monster Death Combat Animation
          if (onCombatTrigger) {
            onCombatTrigger('player_attack');
          }

          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#7D8D39', '#F59E0B', '#1E2522']
          });

          onStageClear(stage.stageNumber, stage.xp, {
            duration_ms: elapsedMs,
            keystrokes,
            codeLength: code.length
          });
        } else {
          // Trigger Monster Counter-Attack & HP Damage
          if (onCombatTrigger) {
            onCombatTrigger('monster_attack');
          }

          simOutput = `[Execution Failure]\nOutput did not match expected solution!\nExpected output format:\n${stage.expectedOutput}\n\n[Warning]: The monster struck back! HP reduced!`;
          setStatus('error');
          setOutput(simOutput);
          setErrorMessage('Validation tests failed. Monster retaliated!');

          if (onStageFailed) {
            onStageFailed();
          }
        }
      } catch (err) {
        if (onCombatTrigger) {
          onCombatTrigger('monster_attack');
        }
        setStatus('error');
        setOutput(`[Syntax/Runtime Error]: ${err.message}\nMonster retaliated!`);
        setErrorMessage(err.message);
        if (onStageFailed) onStageFailed();
      } finally {
        setIsRunning(false);
      }
    }, 600);
  };

  const handleReset = () => {
    setCode(stage.starterCode || '');
    setOutput('');
    setStatus('idle');
    setErrorMessage('');
  };

  const linesCount = Math.max(7, code.split('\n').length);

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Section: Theory & Task Problem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Theory & Syllabus Card */}
        <div className="neo-box p-3.5 bg-white flex flex-col">
          <div className="flex items-center gap-2 pb-1.5 mb-2 border-b-2 border-[#1E2522]">
            <BookOpen className="w-4 h-4 text-[#7D8D39]" />
            <h3 className="font-extrabold text-xs uppercase text-[#1E2522]">
              Theory & Syllabus
            </h3>
            <span className="ml-auto font-mono text-[10px] bg-[#E7EEDB] px-1.5 py-0.2 border border-[#1E2522] text-[#586526] font-bold">
              {stage.concept}
            </span>
          </div>

          <div className="font-mono text-xs whitespace-pre-line text-[#1E2522] leading-relaxed bg-[#F3F6F4] p-2.5 border-2 border-[#1E2522] max-h-40 overflow-y-auto">
            {stage.theory}
          </div>
        </div>

        {/* Task Challenge Card */}
        <div className="neo-box p-3.5 bg-[#FEFDF9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-[#1E2522]">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#D97706]" />
                <h4 className="font-extrabold text-xs uppercase text-[#1E2522]">
                  Stage Objective
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
              {stage.question}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <div className="bg-[#E7EEDB] border border-[#1E2522] px-2 py-1 font-mono text-[11px] text-[#586526] font-bold flex items-center gap-1">
              <span>Expected:</span>
              <span className="text-[#1E2522] font-mono">{stage.expectedOutput.replace('\n', ' ')}</span>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] font-mono font-bold text-[#586526] flex items-center gap-1 hover:underline"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{showHint ? 'Hide' : 'Hint'}</span>
            </button>
          </div>

          {showHint && (
            <div className="mt-2 bg-[#FEF9C3] p-2 border-2 border-[#1E2522] font-mono text-[11px] text-[#713F12]">
              <strong>Hint Solution:</strong>
              <pre className="mt-1 bg-white p-1 border border-[#1E2522] overflow-x-auto text-[10px]">
                {stage.solution}
              </pre>
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
              <span className="font-mono text-xs text-gray-300 ml-2">combat_script_editor</span>
            </div>
            <button 
              onClick={handleReset}
              className="text-[11px] font-mono text-gray-400 hover:text-white flex items-center gap-1 px-2 py-0.5 border border-gray-600 rounded"
              title="Reset starter code"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
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
              <span>Keystrokes: {keystrokes}</span>
              <span>•</span>
              <span className="text-[#10B981]">Combat Engine Ready</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runEvaluation}
                disabled={isRunning}
                className="neo-button text-xs py-1.5 px-4 gap-1.5 flex items-center bg-[#7D8D39] hover:bg-[#8fa042]"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Casting...' : 'Cast Spell & Attack'}</span>
              </button>

              {status === 'cleared' && hasNextStage && (
                <button
                  onClick={onNextStage}
                  className="neo-button text-xs py-1.5 px-3.5 gap-1 flex items-center bg-[#F59E0B] text-black border-black hover:bg-[#fbbf24]"
                >
                  <span>Next Dungeon ❯</span>
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
              <span>Battle Log & Test Output</span>
            </div>
            {status === 'cleared' && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#586526] bg-[#E7EEDB] px-1.5 py-0.2 border border-[#1E2522]">
                <CheckCircle2 className="w-3 h-3" />
                MONSTER DEFEATED
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.2 border border-[#1E2522]">
                <AlertCircle className="w-3 h-3" />
                DAMAGE TAKEN
              </span>
            )}
          </div>

          <div className="font-mono text-xs bg-[#1E2522] text-[#A7F3D0] p-2.5 border-2 border-[#1E2522] min-h-[64px] max-h-32 overflow-y-auto whitespace-pre-wrap">
            {output ? output : (
              <span className="text-gray-500 italic">
                Write code above and press "Cast Spell & Attack" to attack the monster!
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
