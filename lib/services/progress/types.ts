import { Module } from '../modules/types';

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

// Tasks
// Questions
