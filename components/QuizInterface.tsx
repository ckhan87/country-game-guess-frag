
import React from 'react';
import { Country } from '../types';

interface QuizInterfaceProps {
  currentTarget: Country;
  options: Country[];
  onSelect: (id: string) => void;
  disabled: boolean;
  selectedId: string | null;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ 
  currentTarget, 
  options, 
  onSelect, 
  disabled,
  selectedId
}) => {
  const flagUrl = `https://flagcdn.com/w320/${currentTarget.id}.png`;

  return (
    <div className="w-full max-w-xl mx-auto px-4 z-10 pointer-events-none mt-20 md:mt-28">
      <div className="glass p-5 md:p-8 rounded-[2.5rem] pointer-events-auto shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Flag Image */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-8 bg-blue-500/10 blur-3xl rounded-full opacity-40"></div>
          <img 
            src={flagUrl} 
            alt="Flag"
            className="relative h-20 md:h-32 w-auto rounded-lg shadow-2xl border-2 border-white/20 transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.5em] mb-4 text-center">
          IDENTIFY THE COUNTRY
        </div>

        {/* Options */}
        <div className="w-full grid grid-cols-1 gap-2.5">
          {options.map((opt) => {
            const isCorrect = opt.id === currentTarget.id;
            const isSelected = opt.id === selectedId;
            
            let feedbackClass = "glass border-white/10";
            if (selectedId) {
              if (isCorrect) {
                feedbackClass = "bg-green-600/80 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-[1.02]";
              } else if (isSelected) {
                feedbackClass = "bg-red-600/80 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]";
              } else {
                feedbackClass = "opacity-40 border-white/5";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                disabled={disabled}
                className={`group w-full rounded-xl px-5 py-4 flex justify-between items-center transition-all duration-300 border-2 active:scale-95 disabled:cursor-default ${feedbackClass}`}
              >
                <span className={`font-bold text-base md:text-xl truncate max-w-[60%] text-left ${selectedId ? 'text-white' : 'text-white/90'}`}>
                  {opt.name}
                </span>
                <span className={`font-black text-lg md:text-2xl whitespace-nowrap ml-2 ${selectedId ? 'text-white' : 'text-blue-400 text-glow-blue'}`}>
                  {opt.cnName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
