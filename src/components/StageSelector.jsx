import React from 'react';
import { Lock, Check, Play, Star } from 'lucide-react';

export default function StageSelector({ 
  stages, 
  currentStageNumber, 
  clearedStageNumbers = [], 
  onSelectStage 
}) {
  return (
    <div className="w-full neo-box p-4 bg-white mb-6">
      <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#1E2522]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm uppercase text-[#1E2522]">
            Stage Roadmap
          </span>
          <span className="text-[11px] font-mono font-bold bg-[#E7EEDB] text-[#586526] px-2 py-0.5 border border-[#1E2522]">
            {clearedStageNumbers.length} / {stages.length} Cleared
          </span>
        </div>
        <span className="text-xs font-mono text-gray-500">
          Click any unlocked level to play
        </span>
      </div>

      {/* Grid of 15 Stage Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const isCleared = clearedStageNumbers.includes(stage.stageNumber);
          const isCurrent = currentStageNumber === stage.stageNumber;
          // Stage is unlocked if it's cleared or stage 1 or previous stage is cleared
          const isUnlocked = stage.stageNumber === 1 || 
                             clearedStageNumbers.includes(stage.stageNumber - 1) || 
                             isCleared;

          return (
            <button
              key={stage.stageNumber}
              onClick={() => isUnlocked && onSelectStage(stage.stageNumber)}
              disabled={!isUnlocked}
              className={`p-2.5 text-left transition-all border-3 ${
                isCurrent 
                  ? 'bg-[#E7EEDB] border-[#7D8D39] shadow-[4px_4px_0px_#7D8D39] translate-x-[-1px] translate-y-[-1px]' 
                  : isCleared
                    ? 'bg-white border-[#1E2522] shadow-[2px_2px_0px_#1E2522] hover:bg-[#F3F6F4]'
                    : isUnlocked
                      ? 'bg-white border-[#1E2522] shadow-[2px_2px_0px_#1E2522] hover:bg-[#F3F6F4]'
                      : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold uppercase">
                  LVL {stage.stageNumber}
                </span>
                {isCleared ? (
                  <span className="w-4 h-4 bg-[#7D8D39] text-white rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : isUnlocked ? (
                  <Play className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#7D8D39] fill-[#7D8D39]' : 'text-gray-400'}`} />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                )}
              </div>

              <div className="font-bold text-xs line-clamp-1 text-[#1E2522]">
                {stage.title}
              </div>

              <div className="flex items-center gap-1 mt-1 font-mono text-[10px] text-[#586526]">
                <Star className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span>{stage.xp} XP</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
