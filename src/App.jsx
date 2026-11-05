import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GameCanvas from './components/GameCanvas';
import StageSelector from './components/StageSelector';
import CodePlayground from './components/CodePlayground';
import LeaderboardModal from './components/LeaderboardModal';
import AdminPanel from './components/AdminPanel';
import { SYLLABUS_TRACKS } from './data/syllabus';
import { loadLocalProgress, saveLocalProgress } from './lib/supabase';
import { BookMarked, Award, Gamepad2, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTrackId, setCurrentTrackId] = useState('python');
  const [currentStageNumber, setCurrentStageNumber] = useState(1);
  const [progress, setProgress] = useState(loadLocalProgress());
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const currentTrack = SYLLABUS_TRACKS[currentTrackId] || SYLLABUS_TRACKS.python;
  const currentStage = currentTrack.stages.find(s => s.stageNumber === currentStageNumber) || currentTrack.stages[0];

  const clearedStages = progress.clearedStages[currentTrackId] || [1];
  const isCurrentStageCleared = clearedStages.includes(currentStageNumber);

  useEffect(() => {
    saveLocalProgress(progress);
  }, [progress]);

  const handleSelectTrack = (trackId) => {
    setCurrentTrackId(trackId);
    setCurrentStageNumber(1);
  };

  const handleStageClear = (stageNum, xpAwarded, entropy) => {
    setProgress(prev => {
      const trackCleared = prev.clearedStages[currentTrackId] || [];
      const isNewClear = !trackCleared.includes(stageNum);

      const nextTrackCleared = isNewClear 
        ? [...trackCleared, stageNum] 
        : trackCleared;

      // Unlock next stage automatically
      const nextStageToUnlock = stageNum + 1;
      if (!nextTrackCleared.includes(nextStageToUnlock) && nextStageToUnlock <= 15) {
        nextTrackCleared.push(nextStageToUnlock);
      }

      return {
        ...prev,
        xp: prev.xp + (isNewClear ? xpAwarded : 15),
        streak: prev.streak + (isNewClear ? 1 : 0),
        clearedStages: {
          ...prev.clearedStages,
          [currentTrackId]: nextTrackCleared
        }
      };
    });
  };

  const handleNextStage = () => {
    if (currentStageNumber < currentTrack.stages.length) {
      setCurrentStageNumber(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F4] text-[#1E2522] flex flex-col font-sans">
      
      {/* Top HUD Navigation */}
      <Navbar
        currentTrack={currentTrackId}
        onSelectTrack={handleSelectTrack}
        xp={progress.xp}
        streak={progress.streak}
        role={progress.role}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Track Banner Info */}
        <div className="neo-box p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-[#F3F6F4] border-2 border-[#1E2522]">
              {currentTrack.icon}
            </span>
            <div>
              <h1 className="font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-[#1E2522]">
                {currentTrack.name} Track: Stage {currentStageNumber}
              </h1>
              <p className="text-xs font-mono text-gray-600">
                {currentTrack.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 bg-[#E7EEDB] border-2 border-[#1E2522] text-[#586526] font-bold">
              Total Stages: {currentTrack.stages.length}
            </span>
          </div>
        </div>

        {/* 2D Pixel Canvas Game Screen */}
        <GameCanvas
          currentTrack={currentTrackId}
          stageNumber={currentStageNumber}
          stageTitle={currentStage.title}
          isEvaluating={isEvaluating}
          isCleared={isCurrentStageCleared}
          streak={progress.streak}
        />

        {/* Stage Roadmap Selector */}
        <StageSelector
          stages={currentTrack.stages}
          currentStageNumber={currentStageNumber}
          clearedStageNumbers={clearedStages}
          onSelectStage={(num) => setCurrentStageNumber(num)}
        />

        {/* Interactive Theory & Code Challenge Runner */}
        <CodePlayground
          stage={currentStage}
          isCleared={isCurrentStageCleared}
          onStageClear={handleStageClear}
          onNextStage={handleNextStage}
          hasNextStage={currentStageNumber < currentTrack.stages.length}
        />

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#1E2522] bg-white p-4 font-mono text-xs text-center text-gray-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            PIXELCODER © 2026 • Built with React.js, Supabase & Neobrutalism UI
          </span>
          <span className="text-[#586526] font-bold">
            Authoritative Server Validation • w3schools Syllabus Aligned
          </span>
        </div>
      </footer>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentXp={progress.xp}
        currentUsername={progress.username}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
}
