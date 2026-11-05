import React, { useEffect, useRef, useState } from 'react';

export default function GameCanvas({ 
  currentTrack, 
  stageNumber, 
  stageTitle, 
  isEvaluating, 
  isCleared,
  streak = 1 
}) {
  const canvasRef = useRef(null);
  const [spriteState, setSpriteState] = useState('idle'); // 'idle' | 'running' | 'victory'

  useEffect(() => {
    if (isEvaluating) {
      setSpriteState('running');
    } else if (isCleared) {
      setSpriteState('victory');
      const timer = setTimeout(() => setSpriteState('idle'), 3000);
      return () => clearTimeout(timer);
    } else {
      setSpriteState('idle');
    }
  }, [isEvaluating, isCleared]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Load sprite frames
    const idleFrames = [
      '/assets/platformer/Character/Animations/Idle/idle1.png',
      '/assets/platformer/Character/Animations/Idle/idle2.png',
    ];
    const runFrames = [
      '/assets/platformer/Character/Animations/Run/run1.png',
      '/assets/platformer/Character/Animations/Run/run2.png',
      '/assets/platformer/Character/Animations/Run/run3.png',
      '/assets/platformer/Character/Animations/Run/run4.png',
    ];

    const idleImages = idleFrames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const runImages = runFrames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let animationFrameId;
    let tick = 0;
    let playerX = 80;
    let playerY = 118;
    let targetX = 80;

    // Floating collectibles / stars
    const stars = [
      { x: 180, y: 80, frame: 0 },
      { x: 300, y: 70, frame: 1 },
      { x: 420, y: 85, frame: 2 },
      { x: 540, y: 75, frame: 3 },
    ];

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Sky & Clouds Background (Neobrutalist Pixel Palette)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#B8D0A4');
      grad.addColorStop(0.7, '#D3E2C4');
      grad.addColorStop(1, '#F3F6F4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pixel Clouds
      ctx.fillStyle = '#FFFFFF';
      const cloudOffset = (tick * 0.2) % (canvas.width + 100);
      [
        { x: (cloudOffset + 50) % (canvas.width + 100) - 50, y: 25, w: 70, h: 18 },
        { x: (cloudOffset + 320) % (canvas.width + 100) - 50, y: 40, w: 90, h: 22 },
        { x: (cloudOffset + 580) % (canvas.width + 100) - 50, y: 20, w: 60, h: 16 }
      ].forEach(c => {
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.fillRect(c.x + 8, c.y - 6, c.w - 16, 6);
        ctx.fillRect(c.x + 14, c.y + c.h, c.w - 28, 4);
      });

      // 2. Platform Ground (Bold Neobrutalism Pixel Blocks)
      const groundY = 150;
      ctx.fillStyle = '#7D8D39'; // Olive Green Grass Top
      ctx.fillRect(0, groundY, canvas.width, 10);
      
      ctx.fillStyle = '#556224'; // Grass shadow
      ctx.fillRect(0, groundY + 10, canvas.width, 4);

      ctx.fillStyle = '#C4CEB5'; // Earth base
      ctx.fillRect(0, groundY + 14, canvas.width, canvas.height - (groundY + 14));

      // Ground brick grid pattern
      ctx.fillStyle = '#1E2522';
      ctx.fillRect(0, groundY, canvas.width, 3); // top border line
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.fillRect(x, groundY + 14, 2, canvas.height);
      }
      for (let y = groundY + 14; y < canvas.height; y += 16) {
        ctx.fillRect(0, y, canvas.width, 2);
      }

      // 3. Stage Portal / Flag at Right
      const flagX = canvas.width - 70;
      ctx.fillStyle = '#1E2522';
      ctx.fillRect(flagX, 60, 4, 90); // pole
      ctx.fillStyle = isCleared ? '#F59E0B' : '#7D8D39'; // golden if cleared
      ctx.beginPath();
      ctx.moveTo(flagX + 4, 62);
      ctx.lineTo(flagX + 34, 75);
      ctx.lineTo(flagX + 4, 88);
      ctx.fill();
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Signpost on left
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(30, 105, 6, 45);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 85, 46, 22);
      ctx.fillRect(10, 85, 46, 22);
      ctx.fillStyle = '#1E2522';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`LVL ${stageNumber}`, 14, 100);

      // 4. Floating XP Gems
      stars.forEach((s, idx) => {
        const floatY = s.y + Math.sin((tick + idx * 25) * 0.08) * 4;
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(s.x, floatY, 8, 8);
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(s.x + 2, floatY + 2, 4, 4);
        ctx.strokeStyle = '#1E2522';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(s.x, floatY, 8, 8);
      });

      // 5. Draw Animated Character
      let activeImage;
      const frameSpeed = spriteState === 'running' ? 6 : 18;
      const frameIndex = Math.floor(tick / frameSpeed);

      if (spriteState === 'running') {
        activeImage = runImages[frameIndex % runImages.length];
        targetX = Math.min(canvas.width - 120, 80 + (stageNumber * 30));
        playerX += (targetX - playerX) * 0.05;
      } else if (spriteState === 'victory') {
        activeImage = runImages[frameIndex % runImages.length];
        playerY = 118 - Math.abs(Math.sin(tick * 0.15)) * 25; // bounce in air
      } else {
        activeImage = idleImages[frameIndex % idleImages.length];
        playerY = 118;
      }

      const spriteWidth = 32;
      const spriteHeight = 32;

      if (activeImage && activeImage.complete && activeImage.naturalWidth > 0) {
        ctx.drawImage(activeImage, playerX, playerY, spriteWidth, spriteHeight);
      } else {
        // Fallback pixel avatar block
        ctx.fillStyle = '#7D8D39';
        ctx.fillRect(playerX + 6, playerY + 8, 20, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(playerX + 16, playerY + 12, 4, 4); // eye
        ctx.strokeStyle = '#1E2522';
        ctx.lineWidth = 2;
        ctx.strokeRect(playerX + 6, playerY + 8, 20, 24);
      }

      // Character Tag Bubble
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1E2522';
      ctx.lineWidth = 2;
      const bubbleText = spriteState === 'victory' ? 'STAGE CLEARED!' : (spriteState === 'running' ? 'Compiling...' : 'Aria Lv.' + stageNumber);
      ctx.strokeRect(playerX - 15, playerY - 20, 70, 16);
      ctx.fillRect(playerX - 15, playerY - 20, 70, 16);
      ctx.fillStyle = spriteState === 'victory' ? '#7D8D39' : '#1E2522';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(bubbleText, playerX - 11, playerY - 9);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [spriteState, stageNumber, isCleared]);

  return (
    <div className="w-full neo-box p-3 bg-white mb-6">
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#1E2522]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#EF4444] rounded-full border border-black inline-block"></span>
          <span className="w-3 h-3 bg-[#F59E0B] rounded-full border border-black inline-block"></span>
          <span className="w-3 h-3 bg-[#7D8D39] rounded-full border border-black inline-block"></span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1E2522] ml-2">
            2D PIXEL STAGE VIEW // {currentTrack.toUpperCase()} TRACK - STAGE {stageNumber}: {stageTitle}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold font-mono">
          <span className="px-2 py-0.5 bg-[#E7EEDB] border border-[#1E2522] text-[#586526]">
            STATUS: {spriteState.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 bg-[#FEF3C7] border border-[#1E2522] text-[#B45309]">
            🔥 STREAK: {streak}D
          </span>
        </div>
      </div>
      
      <div className="relative border-3 border-[#1E2522] bg-[#F3F6F4] overflow-hidden rounded-sm">
        <canvas 
          ref={canvasRef} 
          width={720} 
          height={180} 
          className="w-full h-auto block pixelated"
        />
      </div>
    </div>
  );
}
