import { marathiAlphabet } from '@/lib/marathi-data';
import { subDays, subHours } from 'date-fns';
import { beforeEach } from 'node:test';
import { describe, expect, it } from 'vitest';
import { LetterService } from '../../letter-service';
import { exerciseService } from '../exercise-service';

let index = 0;

describe('ExerciseService', () => {
  beforeEach(() => {
    index = 0;
  });

  describe('getExerciseLetters', () => {
    it('should get random exercise letters when no challenges are present', () => {
      const letters = exerciseService.getExerciseLetters([], 'marathi-to-latin');
      expect(letters).toHaveLength(8);
    });

    it('should get random exercise letters when only 14 challenges are present', () => {
      const letters = exerciseService.getExerciseLetters(mockChallenges(14), 'marathi-to-latin');
      expect(letters).toHaveLength(8);
    });

    it('should get 8 letters when 15 challenges are present', () => {
      const letters = exerciseService.getExerciseLetters(mockChallenges(15), 'marathi-to-latin');
      expect(letters).toHaveLength(8);
    });

    it("should add the two questions that hasn't been answered for the longest time", () => {
      const challenges = mockChallenges(13);
      const expectedLetters = [
        marathiAlphabet[marathiAlphabet.length - 1].marathi,
        marathiAlphabet[marathiAlphabet.length - 2].marathi,
      ];

      challenges.push({
        letter: expectedLetters[0],
        flawless: 0,
        lastActivity: subHours(new Date(), 1),
      });

      challenges.push({
        letter: expectedLetters[1],
        flawless: 0,
        lastActivity: subHours(new Date(), 2),
      });

      const letters = exerciseService.getExerciseLetters(challenges, 'marathi-to-latin');

      expect(letters).toHaveLength(8);
      expect(letters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marathi: expectedLetters[0] }),
          expect.objectContaining({ marathi: expectedLetters[1] }),
        ])
      );
    });

    it("should add the two questions that hasn't been answered for the longest time (even if flawless)", () => {
      const challenges = mockChallenges(13);
      const expectedLetters = [
        marathiAlphabet[marathiAlphabet.length - 1].marathi,
        marathiAlphabet[marathiAlphabet.length - 2].marathi,
      ];

      challenges.push({
        letter: expectedLetters[0],
        flawless: 5,
        lastActivity: subHours(new Date(), 1),
      });

      challenges.push({
        letter: expectedLetters[1],
        flawless: 5,
        lastActivity: subHours(new Date(), 2),
      });

      const letters = exerciseService.getExerciseLetters(challenges, 'marathi-to-latin');

      expect(letters).toHaveLength(8);
      expect(letters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marathi: expectedLetters[0] }),
          expect.objectContaining({ marathi: expectedLetters[1] }),
        ])
      );
    });

    it('should skip flawless challenges when they are not the last two', () => {
      const challenges: GetExerciseLettersChallenge = [];

      const expectedLetters = Array.from({ length: 15 }, (_, i) => marathiAlphabet[i].marathi);

      // not flawless today
      Array.from({ length: 5 }, (_, i) => {
        challenges.push({
          letter: expectedLetters[i],
          flawless: 0,
          lastActivity: new Date(),
        });
      });

      // flawless yesterday
      Array.from({ length: 7 }, (_, i) => {
        challenges.push({
          letter: expectedLetters[5 + i],
          flawless: 5,
          lastActivity: subDays(new Date(), 1),
        });
      });

      // not flawless two days ago
      Array.from({ length: 3 }, (_, i) => {
        challenges.push({
          letter: expectedLetters[12 + i],
          flawless: 0,
          lastActivity: subDays(new Date(), 2),
        });
      });

      const letters = exerciseService.getExerciseLetters(challenges, 'marathi-to-latin');

      expect(letters).toHaveLength(8);
      expect(letters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marathi: expectedLetters[0] }),
          expect.objectContaining({ marathi: expectedLetters[1] }),
          expect.objectContaining({ marathi: expectedLetters[2] }),
          expect.objectContaining({ marathi: expectedLetters[3] }),
          expect.objectContaining({ marathi: expectedLetters[4] }),
          expect.objectContaining({ marathi: expectedLetters[12] }),
          expect.objectContaining({ marathi: expectedLetters[13] }),
          expect.objectContaining({ marathi: expectedLetters[14] }),
        ])
      );

      Array.from({ length: 7 }, (_, i) => expectedLetters[5 + i]).forEach((letter, index) => {
        const i = index + 5;
        expect(
          letters,
          `letter ${letter} (${LetterService.getLetter(letter).latin}, index: ${i}) should not be in the exercise`
        ).not.toEqual(expect.arrayContaining([expect.objectContaining({ marathi: letter })]));
      });
    });

    it('should add new letters when the user has 80% of the challenges flawless', () => {
      const challenges = Array.from({ length: 15 }, (_, i) => {
        return {
          letter: marathiAlphabet[i].marathi,
          flawless: 0,
          lastActivity: subHours(new Date(), i),
        };
      });

      // make 0 and 1 oldest
      challenges[0].lastActivity = subDays(new Date(), 2);
      challenges[1].lastActivity = subDays(new Date(), 3);

      // make 0-12 flawless
      challenges.slice(0, 12).forEach(challenge => {
        challenge.flawless = 5;
      });

      const letters = exerciseService.getExerciseLetters(challenges, 'marathi-to-latin');

      expect(letters).toHaveLength(8);
      expect(letters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marathi: challenges[0].letter }),
          expect.objectContaining({ marathi: challenges[1].letter }),
          expect.objectContaining({ marathi: challenges[12].letter }),
          expect.objectContaining({ marathi: challenges[13].letter }),
          expect.objectContaining({ marathi: challenges[14].letter }),
        ])
      );
    });
  });
});

function mockChallenges(amount: number) {
  return Array.from({ length: amount }, (_, i) => createMockChallenge());
}

type GetExerciseLettersChallenge = Parameters<typeof exerciseService.getExerciseLetters>[0];

function createMockChallenge(): GetExerciseLettersChallenge[number] {
  return {
    flawless: 0,
    lastActivity: new Date(),
    letter: marathiAlphabet[index++ % marathiAlphabet.length].marathi,
  };
}
