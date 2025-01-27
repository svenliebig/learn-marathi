import { db } from '@/lib/db';
import { ExerciseProgress, UserProgress } from '@/lib/types';

export class ProgressService {
  async getUserProgress(userId: string): Promise<UserProgress> {
    const progress = await db.getUserProgress(userId);
    return this.calculateStreakAndProgress(progress);
  }

  async updateProgress(
    userId: string,
    exerciseMode: string,
    letterKey: string,
    isCorrect: boolean
  ) {
    const progress = await db.getUserProgress(userId);

    if (!progress.exercises[exerciseMode]) {
      progress.exercises[exerciseMode] = {
        completedLetters: [],
        letterStats: {},
      };
    }

    const stats = this.updateLetterStats(
      progress.exercises[exerciseMode],
      letterKey,
      isCorrect
    );

    // Check for mastery
    if (
      this.hasAchievedMastery(stats) &&
      !progress.exercises[exerciseMode].completedLetters.includes(letterKey)
    ) {
      progress.exercises[exerciseMode].completedLetters.push(letterKey);
    }

    // Update streak and activity
    const updatedProgress = this.updateStreakAndActivity(progress);

    await db.updateUserProgress(userId, updatedProgress);
    return updatedProgress;
  }

  private updateLetterStats(
    exerciseProgress: ExerciseProgress,
    letterKey: string,
    isCorrect: boolean
  ) {
    if (!exerciseProgress.letterStats[letterKey]) {
      exerciseProgress.letterStats[letterKey] = {
        attempts: 0,
        correct: 0,
        lastTenAttempts: [],
      };
    }

    const stats = exerciseProgress.letterStats[letterKey];
    stats.attempts++;
    if (isCorrect) stats.correct++;
    stats.lastTenAttempts = [...stats.lastTenAttempts.slice(-9), isCorrect];

    return stats;
  }

  private hasAchievedMastery(stats: { lastTenAttempts: boolean[] }) {
    return (
      stats.lastTenAttempts.length >= 10 &&
      stats.lastTenAttempts.every(attempt => attempt)
    );
  }

  private updateStreakAndActivity(progress: UserProgress): UserProgress {
    const today = new Date().toISOString().split('T')[0];

    if (progress.lastActivity !== today) {
      const lastDate = progress.lastActivity
        ? new Date(progress.lastActivity)
        : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastDate &&
        lastDate.toISOString().split('T')[0] ===
          yesterday.toISOString().split('T')[0]
      ) {
        progress.streakDays = (progress.streakDays || 0) + 1;
      } else if (!lastDate || lastDate.toISOString().split('T')[0] !== today) {
        progress.streakDays = 1;
      }

      progress.lastActivity = today;
    }

    return progress;
  }

  private calculateStreakAndProgress(progress: UserProgress): UserProgress {
    const today = new Date().toISOString().split('T')[0];

    if (progress.lastActivity !== today) {
      const lastDate = progress.lastActivity
        ? new Date(progress.lastActivity)
        : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        !lastDate ||
        lastDate.toISOString().split('T')[0] !==
          yesterday.toISOString().split('T')[0]
      ) {
        progress.streakDays = 0;
      }
    }

    return progress;
  }
}

export const progressService = new ProgressService();
