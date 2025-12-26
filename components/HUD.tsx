
import React from 'react';
import { GameState } from '../types';
import { DIFFICULTY_CONFIG, TOTAL_QUESTIONS } from '../constants';

interface HUDProps {
  state: GameState;
  onQuit: () => void;
}

export const HUD: React.FC<HUDProps> = ({ state, onQuit }) => {
  const { score, streak, timeLeft, progress, difficulty } = state;
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="fixed inset-x-0 top-0 pointer-events-none z-20 p-4 md:p-8">
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        {/* Left: Home & Massive Timer */}
        <div className="flex gap-4 items-center pointer-events-auto">
          <button 
            onClick={onQuit}
            className="glass w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl shadow-lg active:scale-90 transition-transform hover:bg-white/10 border-2 border-white/10"
            aria-label="返回"
          >
            <span className="text-2xl md:text-3xl">🏠</span>
          </button>

          <div className="glass px-6 py-3 rounded-3xl flex flex-col justify-center border-2 border-white/10 min-w-[120px]">
             <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[10px] md:text-xs text-blue-400 font-black uppercase tracking-widest">{config.label}</span>
                <span className="text-[10px] md:text-xs text-white/50 font-bold">{progress}/{TOTAL_QUESTIONS}</span>
             </div>
             {/* DOUBLED TIMER SIZE */}
             <div className="text-3xl md:text-6xl text-white font-mono font-black leading-none text-glow-blue">
                {config.duration === null ? '∞' : timeLeft}
                {config.duration !== null && <span className="text-base md:text-2xl ml-1 opacity-50 font-sans">s</span>}
             </div>
          </div>
        </div>

        {/* Right: Massive Score & Streak */}
        <div className="flex gap-4 items-center pointer-events-auto">
          {streak > 1 && (
            <div className="bg-blue-600 px-4 py-2 rounded-2xl shadow-lg animate-bounce flex items-center gap-2">
               <span className="text-sm md:text-lg font-black text-white italic">x{streak} 🔥</span>
            </div>
          )}
          <div className="glass px-6 py-4 rounded-[2rem] text-right border-2 border-blue-500/30">
            <div className="text-[10px] md:text-xs text-blue-300 font-bold uppercase tracking-tighter mb-1">SCORE</div>
            <div className="text-3xl md:text-6xl text-white font-black leading-none text-glow-blue">{score}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
