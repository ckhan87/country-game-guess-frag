
import React from 'react';
import { GameState } from '../types';
import { DIFFICULTY_CONFIG } from '../constants';

interface HUDProps {
  state: GameState;
  onQuit: () => void;
}

export const HUD: React.FC<HUDProps> = ({ state, onQuit }) => {
  const { score, streak, timeLeft, progress, difficulty } = state;
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="fixed inset-x-0 top-0 pointer-events-none z-20 p-3 md:p-6">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        {/* Left: Home & Mini Stats */}
        <div className="flex gap-2 items-center pointer-events-auto">
          <button 
            onClick={onQuit}
            className="glass w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl shadow-lg active:scale-90 transition-transform hover:bg-white/10"
            aria-label="返回"
          >
            <span className="text-xl">🏠</span>
          </button>

          <div className="glass px-3 py-1.5 md:px-4 md:py-2 rounded-2xl flex flex-col justify-center min-w-[80px]">
             <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{config.label}</span>
                <span className="text-[10px] text-white/50 font-bold">{progress}/20</span>
             </div>
             <div className="text-white font-mono font-black text-sm md:text-base leading-none mt-0.5">
                {timeLeft}<span className="text-[10px] ml-0.5 opacity-60">s</span>
             </div>
          </div>
        </div>

        {/* Center: Progress Bar (Slim) */}
        <div className="hidden sm:block flex-1 max-w-[120px] mx-4">
          <div className="bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${difficulty === 'HARD' ? 'from-red-500 to-orange-400' : 'from-blue-500 to-cyan-300'} transition-all duration-1000 ease-linear`}
              style={{ width: `${(timeLeft / config.duration) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Right: Score & Streak */}
        <div className="flex gap-2 items-center pointer-events-auto">
          {streak > 1 && (
            <div className="bg-blue-600 px-2 py-1.5 rounded-xl shadow-lg animate-bounce flex items-center gap-1">
               <span className="text-[10px] font-black text-white italic">x{streak} 🔥</span>
            </div>
          )}
          <div className="glass px-4 py-1.5 md:py-2 rounded-2xl text-right">
            <div className="text-[9px] text-blue-300 font-bold uppercase tracking-tighter">SCORE</div>
            <div className="text-lg md:text-xl text-white font-black leading-none">{score}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
