import { marathiAlphabet } from '../marathi-data';

export type Letter = {
  marathi: string;
  latin: string;
  difficulty: number;
};

export class LetterService {
  public static getLetter(loi: string): Letter {
    const letter = marathiAlphabet.find(letter => letter.marathi === loi || letter.latin === loi);

    if (!letter) {
      throw new Error(`Letter ${JSON.stringify(loi)} not found in alphabet`);
    }

    return {
      marathi: letter.marathi,
      latin: letter.latin,
      difficulty: letter.difficulty,
    };
  }

  public static getLatinLetter(marathiLetter: string): string {
    const letter = marathiAlphabet.find(letter => letter.marathi === marathiLetter);

    if (!letter) {
      throw new Error(`Letter ${marathiLetter} not found in alphabet`);
    }

    return letter.latin;
  }

  public static getMarathiLetter(latinLetter: string): string {
    const letter = marathiAlphabet.find(letter => letter.latin === latinLetter);

    if (!letter) {
      throw new Error(`Letter ${latinLetter} not found in alphabet`);
    }

    return letter.marathi;
  }

  public static getRandomLatinLetters(amount: number, difficulty: number = 3): Letter[] {
    const letters = marathiAlphabet.filter(letter => letter.difficulty <= difficulty);
    return letters.sort(() => Math.random() - 0.5).slice(0, amount);
  }

  public static getRandomMarathiLetters(amount: number, difficulty: number = 3): Letter[] {
    const letters = marathiAlphabet.filter(letter => letter.difficulty <= difficulty);
    return letters.sort(() => Math.random() - 0.5).slice(0, amount);
  }

  public static getRandomLatinLetter(difficulty: number = 3): string {
    const letters = marathiAlphabet.filter(letter => letter.difficulty <= difficulty);
    return letters[Math.floor(Math.random() * letters.length)].latin;
  }

  public static getRandomMarathiLetter(difficulty: number = 3): string {
    const letters = marathiAlphabet.filter(letter => letter.difficulty <= difficulty);
    return letters[Math.floor(Math.random() * letters.length)].marathi;
  }

  /**
   * Returns the easiest letters after filtering out the letters that needs to be excluded.
   *
   * If there are no letters left, it will return random letters of any difficulty.
   */
  public static *getEasiestLetters({ exclude }: { exclude: string[] }): Generator<Letter> {
    const letters = marathiAlphabet.filter(
      letter => !exclude.includes(letter.marathi) || !exclude.includes(letter.latin)
    );

    const shuffled = letters
      .toSorted(() => Math.random() - 0.5)
      .toSorted((a, b) => a.difficulty - b.difficulty);

    for (const letter of shuffled) {
      yield letter;
    }

    while (true) {
      const letter = marathiAlphabet.toSorted(() => Math.random() - 0.5)[0];
      yield letter;
    }
  }
}
