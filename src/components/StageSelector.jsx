import React from 'react';
import { Lock, Check, Play, Star } from 'lucide-react';

export default function StageSelector({ 
  stages, 
  currentStageNumber, 
  clearedStageNumbers = [], 
  onSelectStage 
}) {
  return (
    <div className="w-full neo-box p-3 bg-white">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-[#1E2522]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs uppercase text-[#1E2522]">
            Dungeon Roadmap (Stages 1-15)
          </span>
          <span className="text-[10px] font-mono font-bold bg-[#E7EEDB] text-[#586526] px-1.5 py-0.5 border border-[#1E2522]">
            {clearedStageNumbers.length}/15 Cleared
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
          Select level
        </span>
      </div>

      {/* Horizontal Compact Level Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {stages.map((stage) => {
          const isCleared = clearedStageNumbers.includes(stage.stageNumber);
          const isCurrent = currentStageNumber === stage.stageNumber;
          const isUnlocked = stage.stageNumber === 1 || 
                             clearedStageNumbers.includes(stage.stageNumber - 1) || 
                             isCleared;

          return (
            <button
              key={stage.stageNumber}
              onClick={() => isUnlocked && onSelectStage(stage.stageNumber)}
              disabled={!isUnlocked}
              title={`${stage.title} (${stage.xp} XP)`}
              className={`shrink-0 px-2 py-1.5 min-w-[54px] text-center border-2 transition-all font-mono text-xs ${
                isCurrent 
                  ? 'bg-[#7D8D39] text-white border-[#1E2522] shadow-[2px_2px_0px_#1E2522] font-bold' 
                  : isCleared
                    ? 'bg-[#E7EEDB] text-[#586526] border-[#1E2522] hover:bg-[#d5e0b5]'
                    : isUnlocked
                      ? 'bg-white text-[#1E2522] border-[#1E2522] hover:bg-gray-100'
                      : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px]">
                {isCleared ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : isUnlocked ? (
                  <span>L{stage.stageNumber}</span>
                ) : (
                  <Lock className="w-2.5 h-2.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
