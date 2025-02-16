import { ExerciseMode } from '../../types';
import { Letter, LetterService } from '../letter-service';
import { progressService } from '../progress/progress-service';
import { Challenge } from '../progress/types';
import { Exercise } from './types';

export class ExerciseService {
  public async getExercise(userId: string, module: ExerciseMode): Promise<Exercise> {
    const userProgress = await progressService.getFullUserProgress(userId);

    const challenged = userProgress.challenges
      .filter(challenge => challenge.module === module)
      .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime());

    if (challenged.length >= 8) {
      return {
        mode: module,
        size: 8,
        letters: challenged.slice(0, 8).map(challenge => LetterService.getLetter(challenge.letter)),
      };
    }

    const letters = LetterService.getRandomLetters(8, 1);

    return {
      mode: module,
      size: 8,
      letters,
    };
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
  public getExerciseLetters(
    challenges: Array<Omit<Challenge, 'module' | 'mistakes' | 'id' | 'attempts'>>,
    mode: ExerciseMode
  ): Letter[] {
    if (challenges.length <= 14) {
      return this.getRandomLetters(8, 1, mode);
    }

    const sorted = challenges.toSorted(
      (a, b) => a.lastActivity.getTime() - b.lastActivity.getTime()
    );

    const lastTwo = sorted.splice(0, OFFSET);
    const flawed = this.removeFlawless(sorted);

    const nextLetters = [...flawed.slice(0, 8 - lastTwo.length), ...lastTwo].map(challenge =>
      LetterService.getLetter(challenge.letter)
    );

    if (nextLetters.length < 8) {
      let letterGenerator = LetterService.getEasiestLetters({
        exclude: challenges.map(challenge => challenge.letter),
      });

      while (nextLetters.length < 8) {
        const next = letterGenerator.next();
        nextLetters.push({
          latin: next.value.latin,
          marathi: next.value.marathi,
          difficulty: next.value.difficulty,
        });
      }
    }

    return shuffle(nextLetters);
  }

  private getRandomLetters(amount: number, level: number, mode: ExerciseMode): Letter[] {
    return LetterService.getRandomLetters(amount, level);
  }

  private removeFlawless(
    challenges: Array<Omit<Challenge, 'module' | 'mistakes' | 'id' | 'attempts'>>
  ) {
    return challenges.filter(challenge => challenge.flawless < FLAWLESS_THRESHOLD);
  }
}

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const exerciseService = new ExerciseService();

/** The amount of oldest challenges that are definitely included in the exercise */
const OFFSET = 2;
/** The amount of flawless challenges that triggers new letters */
const FLAWLESS_THRESHOLD = 5;
