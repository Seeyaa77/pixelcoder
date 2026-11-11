import React from 'react';
import { Check, Lock } from 'lucide-react';

export default function StageSelector({ stages, currentStageNumber, clearedStageNumbers = [], onSelectStage }) {
  const totalStages = stages.length || 15;

  return (
    <section className="w-full neo-box bg-white p-3" aria-labelledby="roadmap-heading">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 border-b-2 border-[#1E2522] pb-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id="roadmap-heading" className="truncate text-xs font-extrabold uppercase text-[#1E2522]">
            Dungeon Roadmap (Stages 1-{totalStages})
          </h2>
          <span className="shrink-0 border border-[#1E2522] bg-[#E7EEDB] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#586526]">
            {clearedStageNumbers.length}/{totalStages} Cleared
          </span>
        </div>
        <span className="hidden font-mono text-[10px] text-gray-500 sm:inline">Select level</span>
      </div>

      {/* Horizontal compact level strip */}
      <div className="neo-scroll flex items-center gap-1.5 overflow-x-auto pb-1.5" role="group" aria-label="Dungeon stages">
        {stages.map((stage) => {
          const isCleared = clearedStageNumbers.includes(stage.stageNumber);
          const isCurrent = currentStageNumber === stage.stageNumber;
          const isUnlocked =
            stage.stageNumber === 1 || clearedStageNumbers.includes(stage.stageNumber - 1) || isCleared;

          const statusLabel = isCleared ? 'cleared' : isUnlocked ? 'unlocked' : 'locked';
          const stateHint = isCurrent ? ', current stage' : '';

          return (
            <button
              key={stage.stageNumber}
              type="button"
              onClick={() => isUnlocked && onSelectStage(stage.stageNumber)}
              disabled={!isUnlocked}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Stage ${stage.stageNumber}: ${stage.title}. ${statusLabel}${stateHint}. ${stage.xp} XP.`}
              title={`${stage.title} (${stage.xp} XP)`}
              className={`flex min-h-11 min-w-[52px] shrink-0 flex-col items-center justify-center border-2 px-2 py-1 text-center font-mono text-xs transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7D8D39]/50 focus-visible:ring-offset-1 ${
                isCurrent
                  ? 'border-[#1E2522] bg-[#7D8D39] font-bold text-white shadow-[2px_2px_0px_#1E2522]'
                  : isCleared
                    ? 'border-[#1E2522] bg-[#E7EEDB] text-[#586526] hover:bg-[#d5e0b5]'
                    : isUnlocked
                      ? 'border-[#1E2522] bg-white text-[#1E2522] hover:bg-gray-100'
                      : 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 opacity-60'
              }`}
            >
              <span className="flex items-center justify-center gap-1 text-[10px]">
                {isCleared ? (
                  <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                ) : isUnlocked ? (
                  <span>L{stage.stageNumber}</span>
                ) : (
                  <Lock className="h-3 w-3" aria-hidden="true" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
