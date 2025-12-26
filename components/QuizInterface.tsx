
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
    <div className="w-full max-w-xl mx-auto px-4 z-10 pointer-events-none mt-44 md:mt-60">
      <div className="glass p-5 md:p-8 rounded-[3rem] pointer-events-auto shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Flag Image */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-10 bg-blue-500/15 blur-3xl rounded-full opacity-40"></div>
          <img 
            src={flagUrl} 
            alt="Flag"
            className="relative h-24 md:h-36 w-auto rounded-xl shadow-2xl border-2 border-white/20 transition-transform duration-500"
          />
        </div>

        <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em] mb-6 text-center">
          IDENTIFY THE COUNTRY
        </div>

        {/* Options */}
        <div className="w-full grid grid-cols-1 gap-3">
          {options.map((opt) => {
            const isCorrect = opt.id === currentTarget.id;
            const isSelected = opt.id === selectedId;
            
            let feedbackClass = "glass border-white/10 hover:border-blue-500/50 hover:bg-white/5";
            
            // Logic for visual feedback after an answer is locked
            if (disabled) {
              if (isCorrect) {
                // Always highlight the correct answer green once locked
                feedbackClass = "bg-green-600/90 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-[1.02] z-10";
              } else if (isSelected) {
                // Highlight incorrect selection red
                feedbackClass = "bg-red-600/90 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]";
              } else {
                // Dim non-selected, non-correct options
                feedbackClass = "opacity-30 border-white/5 grayscale-[0.5]";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                disabled={disabled}
                className={`group w-full rounded-2xl px-6 py-5 flex justify-between items-center transition-all duration-500 border-2 active:scale-95 disabled:cursor-default ${feedbackClass}`}
              >
                <span className={`font-bold text-lg md:text-2xl truncate pr-4 text-left ${disabled ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                  {opt.name}
                </span>
                <span className={`font-black text-xl md:text-3xl whitespace-nowrap ${disabled ? 'text-white' : 'text-blue-400 text-glow-blue group-hover:text-blue-300'}`}>
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
