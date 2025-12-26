
import React from 'react';

interface GameOverProps {
  score: number;
  correctCount: number;
  onRestartSame: () => void;
  onBackToMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, correctCount, onRestartSame, onBackToMenu }) => {
  const accuracy = Math.round((correctCount / 20) * 100);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="glass p-10 md:p-16 rounded-[4rem] text-center max-w-2xl w-full border border-white/20 shadow-[0_0_100px_rgba(59,130,246,0.3)]">
        <h2 className="text-white text-5xl md:text-6xl font-black mb-2 tracking-tighter">挑战结束</h2>
        <p className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-8">地理探索报告</p>
        
        <div className="bg-white/5 py-12 rounded-[2.5rem] mb-10 border border-white/10">
          <div className="text-[12px] text-white/40 uppercase font-black mb-1">最终得分</div>
          {/* DOUBLED FINAL SCORE SIZE */}
          <div className="text-[8rem] md:text-[14rem] font-black text-white text-glow-blue leading-none">{score}</div>
          <div className="text-xl text-blue-300 mt-10 font-bold">
            正确率: <span className="text-white">{accuracy}% ({correctCount}/20)</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onRestartSame}
            className="group w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-3xl transition-all active:scale-95 shadow-2xl shadow-blue-500/20 text-xl tracking-widest uppercase flex items-center justify-center gap-3"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform">🔄</span> 再战一局
          </button>
          
          <button 
            onClick={onBackToMenu}
            className="w-full bg-white/5 hover:bg-white/10 text-white/70 font-bold py-4 rounded-3xl transition-all active:scale-95 border border-white/10 text-sm tracking-widest uppercase flex items-center justify-center gap-3"
          >
            <span>🏠</span> 返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
};
