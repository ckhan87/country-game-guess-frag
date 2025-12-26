
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GlobeScene } from './components/GlobeScene';
import { HUD } from './components/HUD';
import { QuizInterface } from './components/QuizInterface';
import { GameOver } from './components/GameOver';
import { COUNTRY_DATA, TOTAL_QUESTIONS, DIFFICULTY_CONFIG } from './constants';
import { Country, GameState, GameStatus, Difficulty } from './types';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    streak: 0,
    timeLeft: 0,
    progress: 0,
    correctCount: 0,
    status: GameStatus.IDLE,
    difficulty: Difficulty.EASY,
  });

  const [currentTarget, setCurrentTarget] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const generateQuestion = useCallback((diff: Difficulty) => {
    const config = DIFFICULTY_CONFIG[diff];
    const target = COUNTRY_DATA[Math.floor(Math.random() * COUNTRY_DATA.length)];
    
    let opts = [target];
    while (opts.length < config.optionCount) {
      const random = COUNTRY_DATA[Math.floor(Math.random() * COUNTRY_DATA.length)];
      if (!opts.find(o => o.id === random.id)) {
        opts.push(random);
      }
    }
    
    setCurrentTarget(target);
    setOptions(opts.sort(() => Math.random() - 0.5));
    setIsAnswered(false);
    setSelectedId(null);
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    audioService.stopAmbient();
    audioService.playGameOverMusic();
  }, []);

  const startNewGame = (diff: Difficulty) => {
    const config = DIFFICULTY_CONFIG[diff];
    setGameState({
      score: 0,
      streak: 0,
      timeLeft: config.duration,
      progress: 0,
      correctCount: 0,
      status: GameStatus.PLAYING,
      difficulty: diff,
    });
    audioService.startAmbient();
    audioService.stopGameOverMusic();
    generateQuestion(diff);
  };

  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && gameState.timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            endGame();
            return { ...prev, timeLeft: 0 };
          }
          if (prev.timeLeft <= 10) audioService.playTick(true);
          else if (prev.timeLeft % 10 === 0) audioService.playTick(false);
          
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [gameState.status, endGame]);

  const handleSelect = (id: string) => {
    if (isAnswered || !currentTarget) return;
    setIsAnswered(true);
    setSelectedId(id);

    const isCorrect = id === currentTarget.id;
    const nextProgress = gameState.progress + 1;

    if (isCorrect) {
      audioService.playCorrect();
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        streak: prev.streak + 1,
        correctCount: prev.correctCount + 1,
        progress: nextProgress
      }));
    } else {
      audioService.playWrong();
      setGameState(prev => ({
        ...prev,
        streak: 0,
        progress: nextProgress
      }));
    }

    // Increased timeout to 1.5s so user can see the correct/wrong colors
    setTimeout(() => {
      if (nextProgress >= TOTAL_QUESTIONS) {
        endGame();
      } else {
        generateQuestion(gameState.difficulty);
      }
    }, 1500);
  };

  const handleBackToMenu = () => {
    audioService.stopAmbient();
    audioService.stopGameOverMusic();
    setGameState(prev => ({ ...prev, status: GameStatus.IDLE }));
    setCurrentTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      <GlobeScene 
        targetLocation={currentTarget ? { lat: currentTarget.lat, lon: currentTarget.lon } : null} 
        autoRotate={gameState.status === GameStatus.IDLE} 
      />

      {gameState.status === GameStatus.IDLE && (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent via-[#050510]/50 to-[#050510]">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter mb-4 text-glow-blue leading-none">
              GEO<span className="text-blue-500">QUEST</span>
            </h1>
            <p className="text-blue-300/60 font-bold tracking-[0.3em] text-xs md:text-sm uppercase text-glow-blue">
              Global Geography Exploration Challenge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => {
              const cfg = DIFFICULTY_CONFIG[diff];
              return (
                <button
                  key={diff}
                  onClick={() => startNewGame(diff)}
                  className={`glass p-8 rounded-[2.5rem] border-2 ${cfg.color} hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="text-3xl font-black mb-2">{cfg.label}</div>
                  <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
                    {cfg.duration}s • {cfg.optionCount} 选项
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState.status === GameStatus.PLAYING && currentTarget && (
        <>
          <HUD state={gameState} onQuit={handleBackToMenu} />
          <QuizInterface 
            currentTarget={currentTarget} 
            options={options} 
            onSelect={handleSelect}
            disabled={isAnswered}
            selectedId={selectedId}
          />
        </>
      )}

      {gameState.status === GameStatus.GAME_OVER && (
        <GameOver 
          score={gameState.score} 
          correctCount={gameState.correctCount} 
          onRestartSame={() => startNewGame(gameState.difficulty)} 
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};

export default App;
