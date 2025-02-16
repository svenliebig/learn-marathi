import { db } from '@/lib/persistence/db';
import { persistenceMapper } from '@/lib/persistence/mapper';
import { ExerciseMode } from '@/lib/types';
import { moduleService } from '../modules/module-service';
import { DashboardProgress, ExerciseProgress, MasteryLevel, UserProgress } from './types';

export class ProgressService {
  async getUserProgress(userId: string): Promise<UserProgress> {
    return persistenceMapper.userProgress.toModel(await db.getUserProgress(userId));
  }

  public async getDashboardProgress(userId: string): Promise<DashboardProgress> {
    const progress = await this.getUserProgress(userId);

    const accuracy = this.calculateAccuracy(progress);
    const streak = this.calculateStreak(progress);
    const masteryLevel = this.calculateMasteryLevel(progress);
    const overallProgress = this.calculateOverallProgress(progress);

    const modules = await moduleService.getModules();

    return {
      accuracy,
      streak,
      masteryLevel,
      overallProgress,
      modules: modules.map(module => ({
        module,
        total: 48,
        mastered: progress.exercises[module.id].completedLetters.length,
      })),
    };
  }

  async updateProgress(
    userId: string,
    exerciseMode: ExerciseMode,
    letterKey: string,
    isCorrect: boolean
  ) {
    const progress = await this.getUserProgress(userId);

    if (!progress.exercises[exerciseMode]) {
      progress.exercises[exerciseMode] = {
        completedLetters: [],
        letterStats: {},
      };
    }

    const stats = this.updateLetterStats(progress.exercises[exerciseMode], letterKey, isCorrect);

    // Check for mastery
    if (
      this.hasAchievedMastery(stats) &&
      !progress.exercises[exerciseMode].completedLetters.includes(letterKey)
    ) {
      progress.exercises[exerciseMode].completedLetters.push(letterKey);
    }

    // Update streak and activity
    const updatedProgress = this.updateStreakAndActivity(progress);

    await db.updateUserProgress(
      userId,
      persistenceMapper.userProgress.toPersistence(updatedProgress)
    );
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
    return stats.lastTenAttempts.length >= 10 && stats.lastTenAttempts.every(attempt => attempt);
  }

  private updateStreakAndActivity(progress: UserProgress): UserProgress {
    if (!progress.lastActivity) {
      progress.lastActivity = new Date();
      progress.streak = 1;
      return progress;
    }

    const today = new Date().toISOString().split('T')[0];

    if (progress.lastActivity.toISOString().split('T')[0] !== today) {
      const lastDate = progress.lastActivity ? new Date(progress.lastActivity) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastDate &&
        lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
      ) {
        progress.streak = (progress.streak || 0) + 1;
      } else if (!lastDate || lastDate.toISOString().split('T')[0] !== today) {
        progress.streak = 1;
      }

      progress.lastActivity = new Date();
    }

    return progress;
  }

  private calculateAccuracy(progress: UserProgress): number {
    if (!progress?.exercises) return 0;

    let totalAttempts = 0;
    let totalCorrect = 0;

    Object.values(progress.exercises).forEach(exercise => {
      Object.values(exercise.letterStats).forEach(stats => {
        totalAttempts += stats.attempts;
        totalCorrect += stats.correct;
      });
    });

    return totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  }

  private calculateStreak(progress: UserProgress): number {
    if (!progress.lastActivity) return 0;

    const lastActivity = new Date(progress.lastActivity);
    const today = new Date().toISOString().split('T')[0];

    if (lastActivity.toISOString().split('T')[0] !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        !lastActivity ||
        lastActivity.toISOString().split('T')[0] !== yesterday.toISOString().split('T')[0]
      ) {
        return 0;
      }
    }

    return progress.streak || 0;
  }

  private calculateMasteryLevel(progress: UserProgress): MasteryLevel {
    const completedLetters = Object.values(progress.exercises).reduce(
      (acc, ex) => {
        return {
          completed: acc.completed + ex.completedLetters.length,
          total: acc.total + 100,
        };
      },
      { completed: 0, total: 0 }
    );

    if (completedLetters.completed / completedLetters.total >= 0.9) return 'Master';

    if (completedLetters.completed / completedLetters.total >= 0.7) return 'Advanced';

    if (completedLetters.completed / completedLetters.total >= 0.5) return 'Intermediate';

    if (completedLetters.completed / completedLetters.total >= 0.3) return 'Beginner';

    return 'Novice';
  }

  private calculateOverallProgress(progress: UserProgress): number {
    const totalLetters = Object.values(progress.exercises).reduce(
      (acc, ex) => acc + ex.completedLetters.length,
      0
    );
    return Math.round((totalLetters / 100) * 100);
  }
}

export const progressService = new ProgressService();
