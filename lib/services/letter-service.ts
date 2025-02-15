'use client';

import { marathiAlphabet } from '../marathi-data';

export type Letter = {
  marathi: string;
  latin: string;
  difficulty: number;
};

export class LetterService {
  public static getLatinLetter(marathiLetter: string): string {
    const letter = marathiAlphabet.find(
      letter => letter.marathi === marathiLetter
    );

    if (!letter) {
      throw new Error(`Letter ${marathiLetter} not found in alphabet`);
    }

    return letter.latin;
  }

  public static getRandomLetters(
    amount: number,
    difficulty: number = 3
  ): Letter[] {
    const letters = marathiAlphabet.filter(
      letter => letter.difficulty <= difficulty
    );
    return letters.sort(() => Math.random() - 0.5).slice(0, amount);
  }

  public static getRandomLettersWithAudio(
    amount: number,
    difficulty: number = 3
  ): (Letter & { audio?: HTMLAudioElement })[] {
    const letters = marathiAlphabet.filter(
      letter => letter.difficulty <= difficulty
    );
    const selectedLetters = letters
      .sort(() => Math.random() - 0.5)
      .slice(0, amount);

    if (typeof window !== 'undefined') {
      // Only create Audio objects on the client side
      return selectedLetters.map(letter => ({
        ...letter,
        audio: new Audio(`/audio/marathi/${letter.marathi}.mp3`),
      }));
    }

    // Return letters without audio on server side
    return selectedLetters;
  }

  public static getRandomLatinLetter(difficulty: number = 3): string {
    const letters = marathiAlphabet.filter(
      letter => letter.difficulty <= difficulty
    );
    return letters[Math.floor(Math.random() * letters.length)].latin;
  }

  public static getRandomMarathiLetter(difficulty: number = 3): string {
    const letters = marathiAlphabet.filter(
      letter => letter.difficulty <= difficulty
    );
    return letters[Math.floor(Math.random() * letters.length)].marathi;
  }
}
