import { ExerciseMode } from '../types';
import { LetterService } from './letter-service';

export class AnswerService {
  private mode: ExerciseMode;
  private difficulty: number;

  constructor(mode: ExerciseMode, difficulty: number) {
    this.mode = mode;
    this.difficulty = difficulty;
  }

  public generateAnswers(correct: string): string[] {
    const answers = [correct];

    while (answers.length < 4) {
      const letter = this.getRandomLetter();

      if (!answers.includes(letter)) {
        answers.push(letter);
      }
    }

    return answers.sort(() => Math.random() - 0.5);
  }

  public getRandomLetter(): string {
    return this.mode === 'marathi-to-latin'
      ? LetterService.getRandomLatinLetter(this.difficulty)
      : LetterService.getRandomMarathiLetter(this.difficulty);
  }
}
