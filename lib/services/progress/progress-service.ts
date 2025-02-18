import { db } from '@/lib/persistence/db'
import { persistenceMapper } from '@/lib/persistence/mapper'
import { ExerciseMode } from '@/lib/types'
import { LetterService } from '../letter-service'
import { moduleService } from '../modules/module-service'
import {
  Challenge,
  DashboardProgress,
  MasteryLevel,
  ResolvedUserProgress,
  ResolvedUserProgressService,
  UserProgress,
} from './types'

export class ProgressService implements ResolvedUserProgressService {
  async getUserProgress(userId: string): Promise<UserProgress> {
    return persistenceMapper.userProgress.toModel(await db.getUserProgress(userId))
  }

  async getResolvedUserProgress(userId: string): Promise<ResolvedUserProgress> {
    return persistenceMapper.userProgress.fullToModel(await db.getFullUserProgress(userId))
  }

  public async getDashboardProgress(userId: string): Promise<DashboardProgress> {
    const progress = await this.getResolvedUserProgress(userId)

    const accuracy = this.calculateAccuracy(progress)
    const streak = this.calculateStreak(progress)
    const masteryLevel = this.calculateMasteryLevel(progress)
    const overallProgress = this.calculateOverallProgress(progress)

    const modules = await moduleService.getModules()

    return {
      accuracy,
      streak,
      masteryLevel,
      overallProgress,
      modules: modules.map(module => ({
        module,
        total: 48,
        mastered: this.getMasteredLettersCount(progress.challenges, module.id),
      })),
    }
  }

  private getMasteredLettersCount(challenges: Challenge[], moduleId: string): number {
    return challenges.filter(challenge => challenge.module === moduleId && challenge.flawless >= 10)
      .length
  }

  private calculateAccuracy(progress: ResolvedUserProgress): number {
    if (!progress.challenges.length) return 0

    const totalAttempts = progress.challenges.reduce(
      (sum, challenge) => sum + challenge.attempts,
      0
    )
    const totalFlawless = progress.challenges.reduce(
      (sum, challenge) => sum + challenge.flawless,
      0
    )

    return totalAttempts ? Math.round((totalFlawless / totalAttempts) * 100) : 0
  }

  private calculateStreak(progress: ResolvedUserProgress): number {
    if (!progress.lastActivity) return 0

    const lastActivity = new Date(progress.lastActivity)
    const today = new Date().toISOString().split('T')[0]

    if (lastActivity.toISOString().split('T')[0] !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (
        !lastActivity ||
        lastActivity.toISOString().split('T')[0] !== yesterday.toISOString().split('T')[0]
      ) {
        return 0
      }
    }

    return progress.streak || 0
  }

  private calculateMasteryLevel(progress: ResolvedUserProgress): MasteryLevel {
    const masteredLetters = progress.challenges.filter(challenge => challenge.flawless >= 5).length
    const totalPossibleLetters = 100 // This seems to be hardcoded in the original code

    const ratio = masteredLetters / totalPossibleLetters

    if (ratio >= 0.9) return 'Master'
    if (ratio >= 0.7) return 'Advanced'
    if (ratio >= 0.5) return 'Intermediate'
    if (ratio >= 0.3) return 'Beginner'

    return 'Novice'
  }

  private calculateOverallProgress(progress: ResolvedUserProgress): number {
    const masteredLetters = progress.challenges.filter(challenge => challenge.flawless >= 10).length
    return Math.round((masteredLetters / 100) * 100)
  }

  async updateChallengeByUserId(
    userId: string,
    letter: string,
    answer: string,
    mode: ExerciseMode
  ) {
    const progress = await this.getUserProgress(userId)

    // Update streak and activity
    const updatedProgress = this.updateStreakAndActivity(progress)

    await db.updateUserProgress(
      userId,
      persistenceMapper.userProgress.toPersistence(updatedProgress)
    )

    this.updateChallenge(progress.id, letter, answer, mode)
  }

  async updateChallenge(
    userProgressId: number,
    letter: string,
    answer: string,
    mode: ExerciseMode
  ) {
    const correct = this.isCorrect(letter, answer, mode)
    console.log('[ProgressService] updateChallenge', {
      userProgressId,
      letter,
      answer,
      mode,
      correct,
    })

    let challenge = await db.getChallenge(userProgressId, letter)

    if (!challenge) {
      challenge = await db.insertChallenge(userProgressId, {
        module_id: mode,
        letter,
        attempts: 1,
        user_progress_id: userProgressId,
        flawless: correct ? 1 : 0,
        updated_at: new Date().toISOString(),
      })
    } else {
      const currentFlawless = challenge.flawless ?? 0
      challenge = await db.updateChallenge(userProgressId, {
        ...challenge,
        attempts: (challenge.attempts ?? 0) + 1,
        flawless: correct ? Math.min(currentFlawless + 1, 10) : Math.max(currentFlawless - 1, 0),
        updated_at: new Date().toISOString(),
      })
    }

    if (!correct) {
      await db.addMistake(challenge.id, answer)
    }

    return challenge
  }

  private isCorrect(letter: string, answer: string, mode: ExerciseMode): boolean {
    if (mode === 'marathi-to-latin') {
      return LetterService.getLatinLetter(letter) === answer
    }

    if (mode === 'latin-to-marathi') {
      return LetterService.getMarathiLetter(letter) === answer
    }

    return letter === answer
  }

  private updateStreakAndActivity(progress: UserProgress): UserProgress {
    if (!progress.lastActivity) {
      progress.lastActivity = new Date()
      progress.streak = 1
      return progress
    }

    const today = new Date().toISOString().split('T')[0]

    if (progress.lastActivity.toISOString().split('T')[0] !== today) {
      const lastDate = progress.lastActivity ? new Date(progress.lastActivity) : null
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (
        lastDate &&
        lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
      ) {
        progress.streak = (progress.streak || 0) + 1
      } else if (!lastDate || lastDate.toISOString().split('T')[0] !== today) {
        progress.streak = 1
      }

      progress.lastActivity = new Date()
    }

    return progress
  }
}

export const progressService = new ProgressService()
