// Database Interface
export interface DatabaseInterface {
  getUser(email: string): Promise<User | null>;
  saveUser(user: User): Promise<void>;
  updateUserProgress(userId: string, progress: UserProgress): Promise<void>;
  getUserProgress(userId: string): Promise<UserProgress>;
}

export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  exercises: {
    [exerciseId: string]: ExerciseProgress;
  };
  streakDays?: number;
  lastActivity?: string;
  totalPracticeTime?: number;
  achievements?: Achievement[];
}

export interface ExerciseProgress {
  completedLetters: string[];
  letterStats: {
    [letter: string]: {
      attempts: number;
      correct: number;
      lastTenAttempts: boolean[];
      bestStreak?: number;
      lastPracticed?: string;
    };
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  type: 'streak' | 'mastery' | 'accuracy' | 'speed';
}

export interface MarathiLetter {
  marathi: string;
  latin: string;
  difficulty: number;
}

export type ExerciseMode =
  | 'marathi-to-latin'
  | 'latin-to-marathi'
  | 'translate';
export type ExerciseSize = 8 | 16;

export interface ExerciseState {
  mode: ExerciseMode;
  size: ExerciseSize;
  currentIndex: number;
  letters: MarathiLetter[];
  answers: string[];
  correctAnswer: string;
  score: number;
  mistakes: number;
  history: {
    letter: string;
    correct: boolean;
    timeTaken?: number;
  }[];
}
