
import React from 'react';
import { Country } from '../types';

interface QuizInterfaceProps {
  currentTarget: Country;
  options: Country[];
  onSelect: (id: string) => void;
  disabled: boolean;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ 
  currentTarget, 
  options, 
  onSelect, 
  disabled 
}) => {
  const flagUrl = `https://flagcdn.com/w320/${currentTarget.id}.png`;

  return (
    <div className="w-full max-w-xl mx-auto px-4 z-10 pointer-events-none mt-16 md:mt-24">
      <div className="glass p-5 md:p-8 rounded-[2.5rem] pointer-events-auto shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Flag Image - Optimized Size */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-6 bg-blue-500/10 blur-3xl rounded-full opacity-60"></div>
          <img 
            src={flagUrl} 
            alt="Flag"
            className="relative h-24 md:h-32 w-auto rounded-lg shadow-2xl border-2 border-white/20 transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.5em] mb-4">
          IDENTIFY THE COUNTRY
        </div>

        {/* Options */}
        <div className="w-full grid grid-cols-1 gap-2.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              disabled={disabled}
              className="group w-full glass rounded-xl px-5 py-3.5 flex justify-between items-center transition-all duration-150 active:scale-95 hover:bg-blue-600/20 hover:border-blue-400/30 disabled:opacity-50"
            >
              <span className="text-white/90 font-bold text-base md:text-lg truncate max-w-[50%] text-left">
                {opt.name}
              </span>
              <span className="text-blue-400 font-black text-lg md:text-xl text-glow-blue whitespace-nowrap ml-2">
                {opt.cnName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
