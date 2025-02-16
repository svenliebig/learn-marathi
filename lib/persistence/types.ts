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

  /**
   * Hashed password
   */
  password: string;
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
