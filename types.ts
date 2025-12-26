
export interface Country {
  id: string;
  name: string;
  cnName: string;
  lat: number;
  lon: number;
}

export enum GameStatus {
  LOADING = 'LOADING',
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface GameState {
  score: number;
  streak: number;
  timeLeft: number;
  progress: number;
  correctCount: number;
  status: GameStatus;
  difficulty: Difficulty;
}
