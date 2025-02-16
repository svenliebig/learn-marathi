import { Module } from '../modules/types';

export type UserProgress = {
  id: number;
  userId: string;
  lastActivity: Date | null;
  streak: number;
  exercises: {
    [exerciseId: string]: ExerciseProgress;
  };
};

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

export type DashboardProgress = {
  /**
   * Number of days in a row the user has practiced.
   */
  streak: number;

  /**
   * Accuracy of the user in the last 100 questions.
   */
  accuracy: number;

  /**
   * The level of mastery the user has achieved.
   */
  masteryLevel: MasteryLevel;

  /**
   * The overall progress of the user.
   */
  overallProgress: number;

  /**
   * The modules the user has practiced.
   */
  modules: ModuleProgress[];
};

export type MasteryLevel = 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';

type ModuleProgress = {
  module: Module; // id in database
  total: number;
  mastered: number;
};

type LetterProgress = {
  letter: string;

  /**
   * The total amount of times the letter has been challenged to the user.
   */
  challenged: number;

  /**
   * The amount of times the letter has been answered correctly.
   */
  correctAttempts: number;

  /**
   * The date the letter was last practiced.
   */
  lastPracticed: string;

  /**
   * Whether the letter has been mastered, e.g. the last 10 attempts were correct.
   */
  mastered: boolean;
};
