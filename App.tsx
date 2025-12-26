
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
  const [audioCache, setAudioCache] = useState<{ en: AudioBuffer | null, zh: AudioBuffer | null }>({ en: null, zh: null });
  
  const timerRef = useRef<number | undefined>(undefined);
  const isProcessingNextRef = useRef(false);

  const prefetchAudio = async (target: Country) => {
    try {
      const [enBuffer, zhBuffer] = await Promise.all([
        audioService.fetchTTS(target.name),
        audioService.fetchTTS(target.cnName)
      ]);
      setAudioCache({ en: enBuffer, zh: zhBuffer });
    } catch (e) {
      console.error("Audio prefetch failed", e);
    }
  };

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
    setAudioCache({ en: null, zh: null });
    isProcessingNextRef.current = false;
    
    prefetchAudio(target);

    setGameState(prev => ({
      ...prev,
      timeLeft: config.duration === null ? 0 : config.duration
    }));
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    audioService.stopAmbient();
    audioService.playGameOverMusic();
  }, []);

  const startNewGame = (diff: Difficulty) => {
    setGameState({
      score: 0,
      streak: 0,
      timeLeft: 0,
      progress: 0,
      correctCount: 0,
      status: GameStatus.PLAYING,
      difficulty: diff,
    });
    audioService.startAmbient();
    audioService.stopGameOverMusic();
    generateQuestion(diff);
  };

  const handleSelect = useCallback(async (id: string | null) => {
    // Prevent double triggers
    if (isAnswered || !currentTarget || isProcessingNextRef.current) return;
    
    isProcessingNextRef.current = true;
    setIsAnswered(true);
    setSelectedId(id);

    const isCorrect = id === currentTarget.id;
    const nextProgress = gameState.progress + 1;

    // Update Scores
    if (isCorrect) {
      audioService.playCorrect();
      setGameState(prev => ({
        ...prev,
        score: prev.score + 10,
        streak: prev.streak + 1,
        correctCount: prev.correctCount + 1,
        progress: nextProgress,
        timeLeft: 0
      }));
    } else {
      audioService.playWrong();
      setGameState(prev => ({
        ...prev,
        streak: 0,
        progress: nextProgress,
        timeLeft: 0
      }));
    }

    // MANDATORY TIMING RULES:
    // 1. 1s for English Name
    if (audioCache.en) {
      audioService.playBuffer(audioCache.en);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. 1s for Chinese Name
    if (audioCache.zh) {
      audioService.playBuffer(audioCache.zh);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. 0.5s pause before moving
    await new Promise(resolve => setTimeout(resolve, 500));

    if (nextProgress >= TOTAL_QUESTIONS) {
      endGame();
    } else {
      generateQuestion(gameState.difficulty);
    }
  }, [isAnswered, currentTarget, gameState.progress, gameState.difficulty, audioCache, endGame, generateQuestion]);

  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && !isAnswered) {
      const config = DIFFICULTY_CONFIG[gameState.difficulty];
      if (config.duration === null) return; 

      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) window.clearInterval(timerRef.current);
            // Time out acts as "unclick" - follows same timing rules for correct answer
            handleSelect(null);
            return { ...prev, timeLeft: 0 };
          }
          if (prev.timeLeft <= 2) audioService.playTick(true);
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [gameState.status, gameState.difficulty, isAnswered, handleSelect]);

  const handleBackToMenu = () => {
    audioService.stopAmbient();
    audioService.stopGameOverMusic();
    setGameState(prev => ({ ...prev, status: GameStatus.IDLE }));
    setCurrentTarget(null);
    isProcessingNextRef.current = false;
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
            <h1 className="text-7xl md:text-[12rem] font-black tracking-tighter mb-4 text-glow-blue leading-none">
              GEO<span className="text-blue-500">QUEST</span>
            </h1>
            <p className="text-blue-300/60 font-bold tracking-[0.3em] text-[10px] md:text-sm uppercase text-glow-blue">
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
                  className={`glass p-8 rounded-[2.5rem] border-2 ${cfg.color} hover:scale-105 transition-all duration-300 group relative overflow-hidden active:scale-95`}
                >
                  <div className={`absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="text-3xl font-black mb-2">{cfg.label}</div>
                  <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
                    {cfg.duration}s/题 • {cfg.optionCount} 选项
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
