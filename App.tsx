
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
    timeLeft: 120,
    progress: 0,
    correctCount: 0,
    status: GameStatus.LOADING,
    difficulty: Difficulty.MEDIUM
  });

  const [sessionCountries, setSessionCountries] = useState<Country[]>([]);
  const [currentOptions, setCurrentOptions] = useState<Country[]>([]);
  const [feedback, setFeedback] = useState<{ text: string, type: 'correct' | 'wrong' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startNewGame = useCallback((diff: Difficulty) => {
    audioService.stopAmbient();
    audioService.stopGameOverMusic();
    const config = DIFFICULTY_CONFIG[diff];
    audioService.startAmbient();
    const shuffled = [...COUNTRY_DATA].sort(() => 0.5 - Math.random());
    const session = shuffled.slice(0, TOTAL_QUESTIONS);
    setSessionCountries(session);
    setGameState({
      score: 0,
      streak: 0,
      timeLeft: config.duration,
      progress: 0,
      correctCount: 0,
      status: GameStatus.PLAYING,
      difficulty: diff
    });
    setFeedback(null);
  }, []);

  const handleQuitToMenu = useCallback(() => {
    audioService.stopAmbient();
    audioService.stopGameOverMusic();
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(prev => ({ ...prev, status: GameStatus.IDLE }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState(prev => ({ ...prev, status: GameStatus.IDLE }));
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && gameState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeLeft - 1;
          
          if (newTime <= 10 && newTime > 0) {
            audioService.playTick(true);
          }

          if (newTime <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0, status: GameStatus.GAME_OVER };
          }
          return { ...prev, timeLeft: newTime };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status]);

  useEffect(() => {
    if (gameState.status === GameStatus.GAME_OVER) {
      audioService.stopAmbient();
      audioService.playGameOverMusic();
      const accuracy = (gameState.correctCount / TOTAL_QUESTIONS);
      if (accuracy >= 0.8) {
        setTimeout(() => audioService.playCelebration(), 500);
      }
    }
  }, [gameState.status, gameState.correctCount]);

  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && sessionCountries.length > 0) {
      const target = sessionCountries[gameState.progress];
      if (target) {
        const others = COUNTRY_DATA.filter(c => c.id !== target.id);
        const config = DIFFICULTY_CONFIG[gameState.difficulty];
        const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, config.optionCount - 1);
        const options = [target, ...shuffledOthers].sort(() => 0.5 - Math.random());
        setCurrentOptions(options);
      }
    }
  }, [gameState.status, gameState.progress, sessionCountries, gameState.difficulty]);

  const handleChoice = useCallback((id: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const target = sessionCountries[gameState.progress];
    const isCorrect = id === target.id;
    const config = DIFFICULTY_CONFIG[gameState.difficulty];

    if (isCorrect) {
      audioService.playCorrect();
      setFeedback({ text: '正确！', type: 'correct' });
      setGameState(prev => ({
        ...prev,
        score: Math.round(prev.score + (10 + (prev.streak * 5)) * config.multiplier),
        streak: prev.streak + 1,
        correctCount: prev.correctCount + 1
      }));
    } else {
      audioService.playWrong();
      setFeedback({ text: '错误！', type: 'wrong' });
      setGameState(prev => ({
        ...prev,
        streak: 0
      }));
    }

    setTimeout(() => {
      setFeedback(null);
      setGameState(prev => {
        const nextProgress = prev.progress + 1;
        if (nextProgress >= TOTAL_QUESTIONS) {
          return { ...prev, status: GameStatus.GAME_OVER };
        }
        return { ...prev, progress: nextProgress };
      });
      setIsProcessing(false);
    }, 1200);
  }, [gameState.progress, sessionCountries, isProcessing, gameState.difficulty]);

  const currentTarget = sessionCountries[gameState.progress];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-center">
      <GlobeScene 
        targetLocation={feedback?.type === 'correct' ? currentTarget : null}
        autoRotate={gameState.status !== GameStatus.PLAYING || feedback === null}
      />

      {gameState.status === GameStatus.LOADING && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <div className="text-blue-400 font-bold tracking-widest text-xs uppercase text-center px-4 animate-pulse">
            正在连接卫星...<br />准备地球全景图中
          </div>
        </div>
      )}

      {gameState.status === GameStatus.PLAYING && (
        <>
          <HUD state={gameState} onQuit={handleQuitToMenu} />
          {currentTarget && (
            <QuizInterface 
              currentTarget={currentTarget}
              options={currentOptions}
              onSelect={handleChoice}
              disabled={isProcessing}
            />
          )}
        </>
      )}

      {feedback && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-in zoom-in duration-300`}>
          <div className={`text-6xl md:text-8xl font-black italic drop-shadow-2xl ${
            feedback.type === 'correct' ? 'text-cyan-400' : 'text-red-500'
          }`}>
            {feedback.text}
          </div>
        </div>
      )}

      {gameState.status === GameStatus.IDLE && (
        <div className="z-10 text-center px-6">
          <div className="glass p-8 md:p-12 rounded-[4rem] border border-white/20 inline-block max-w-xl w-full">
            <h1 className="text-white text-4xl md:text-6xl font-black mb-2 tracking-tighter text-glow-blue">国家猜猜猜</h1>
            <p className="text-blue-400 font-bold mb-8 tracking-widest uppercase text-xs">选择你的探险级别</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => {
                const conf = DIFFICULTY_CONFIG[level];
                return (
                  <button
                    key={level}
                    onClick={() => startNewGame(level)}
                    className={`group relative glass p-6 rounded-3xl border-2 transition-all active:scale-95 flex flex-col items-center ${conf.color}`}
                  >
                    <span className="text-xs font-black uppercase tracking-tighter mb-2 opacity-60">
                      {level}
                    </span>
                    <span className="text-2xl font-black mb-1">
                      {conf.label}
                    </span>
                    <span className="text-[10px] font-bold opacity-80">
                      {conf.duration}s | {conf.optionCount}选1
                    </span>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                  </button>
                );
              })}
            </div>
            
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
              挑战越高，得分倍率越高
            </div>
          </div>
        </div>
      )}

      {gameState.status === GameStatus.GAME_OVER && (
        <GameOver 
          score={gameState.score} 
          correctCount={gameState.correctCount} 
          onRestartSame={() => startNewGame(gameState.difficulty)} 
          onBackToMenu={handleQuitToMenu}
        />
      )}
    </div>
  );
};

export default App;
