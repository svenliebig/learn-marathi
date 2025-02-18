import { ExerciseMode } from '../../types'
import { Letter, LetterService } from '../letter-service'
import { progressService } from '../progress/progress-service'
import { Challenge, ResolvedUserProgressService } from '../progress/types'
import { Exercise } from './types'

/**
 * The service that handles the creation of exercises.
 */
export class ExerciseService {
  private readonly progressService: ResolvedUserProgressService

  /** The amount of letters in an exercise */
  public static readonly EXERCISE_SIZE = 8
  /** The amount of oldest challenges that are definitely included in the exercise */
  public static readonly OFFSET = 2
  /** The amount of flawless challenges that triggers new letters */
  public static readonly SOFT_FLAWLESS_THRESHOLD = 5

  /**
   * @param progressService The progress service to use.
   */
  constructor(progressService: ResolvedUserProgressService) {
    this.progressService = progressService
  }

  /**
   * Returns an exercise for a user.
   *
   * @param userId The user's ID.
   * @param module The module to get the exercise for.
   *
   * @returns The exercise.
   */
  public async getExercise(userId: string, module: ExerciseMode): Promise<Exercise> {
    try {
      const userProgress = await this.progressService.getResolvedUserProgress(userId)

      const challenged = userProgress.challenges.filter(challenge => challenge.module === module)
      const letters = this.getExerciseLetters(challenged)

      return {
        mode: module,
        size: ExerciseService.EXERCISE_SIZE,
        letters,
      }
    } catch (e) {
      throw new Error('Failed to get exercise', { cause: e })
    }
  }

  /**
   * Returns letters for an exercise based on the user experience.
   *
   * These rules apply:
   *   - If the user has less than 14 challenges, give them random letters of difficulty 1
   *   - Always add the two questions that hasn't been answered for the longest time,
   *     regardless of flawlessness
   *   - if the user has 70% of the challenges flawless...
   *
   * @param challenges Should already be module filtered.
   * @returns
   */
  private getExerciseLetters(
    challenges: Array<Omit<Challenge, 'module' | 'mistakes' | 'id' | 'attempts'>>
  ): Letter[] {
    if (challenges.length <= 14) {
      return LetterService.getRandomLetters(ExerciseService.EXERCISE_SIZE, 1)
    }

    const sorted = challenges.toSorted(
      (a, b) => a.lastActivity.getTime() - b.lastActivity.getTime()
    )

    const lastTwo = sorted.splice(0, ExerciseService.OFFSET)
    const flawed = this.removeFlawless(sorted)

    const exerciseLetters = [
      ...flawed.slice(0, ExerciseService.EXERCISE_SIZE - lastTwo.length),
      ...lastTwo,
    ].map(challenge => LetterService.getLetter(challenge.letter))

    if (exerciseLetters.length === ExerciseService.EXERCISE_SIZE) {
      return exerciseLetters
    }

    const letterGenerator = LetterService.getEasiestLetters({
      exclude: challenges.map(challenge => challenge.letter),
    })

    while (exerciseLetters.length < ExerciseService.EXERCISE_SIZE) {
      const next = letterGenerator.next()

      if (next.done) {
        /**
         * this should not happen becase it's handled by the {@link LetterService.getEasiestLetters}
         * but we're not sure what's going on here
         */
        throw new Error('Not enough unique letters available')
      }

      if (exerciseLetters.some(nextLetter => nextLetter.marathi === next.value.marathi)) {
        continue
      }

      exerciseLetters.push({
        latin: next.value.latin,
        marathi: next.value.marathi,
        difficulty: next.value.difficulty,
      })
    }

    return shuffle(exerciseLetters)
  }

  private removeFlawless(
    challenges: Array<Omit<Challenge, 'module' | 'mistakes' | 'id' | 'attempts'>>
  ) {
    return challenges.filter(
      challenge => challenge.flawless < ExerciseService.SOFT_FLAWLESS_THRESHOLD
    )
  }
}

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export const exerciseService = new ExerciseService(progressService)
