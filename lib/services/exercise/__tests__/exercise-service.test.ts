import { marathiAlphabet } from '@/lib/marathi-data'
import { subDays, subHours } from 'date-fns'
import { beforeEach } from 'node:test'
import { describe, expect, it } from 'vitest'
import { LetterService } from '../../letter-service'
import { ResolvedUserProgress, ResolvedUserProgressService } from '../../progress/types'
import { ExerciseService } from '../exercise-service'

class MockProgressService implements ResolvedUserProgressService {
  private challenges: ResolvedUserProgress['challenges'] = []

  constructor(challenges: ResolvedUserProgress['challenges'] = []) {
    this.challenges = challenges
  }

  async getResolvedUserProgress(): Promise<ResolvedUserProgress> {
    return {
      id: 1,
      userId: 'test-user',
      lastActivity: new Date(),
      streak: 0,
      challenges: this.challenges,
    }
  }
}

let index = 0

describe('ExerciseService', () => {
  beforeEach(() => {
    index = 0
  })

  describe('getExercise', () => {
    it('should get random exercise letters when no challenges are present', async () => {
      const service = new ExerciseService(new MockProgressService([]))
      const exercise = await service.getExercise('test-user', 'marathi-to-latin')

      expect(exercise.letters).toHaveLength(8)
      expect(exercise.mode).toBe('marathi-to-latin')
      expect(exercise.size).toBe(8)
    })

    it('should get random exercise letters when only 14 challenges are present', async () => {
      const service = new ExerciseService(new MockProgressService(mockChallenges(14)))
      const exercise = await service.getExercise('test-user', 'marathi-to-latin')

      expect(exercise.letters).toHaveLength(8)
    })

    it("should add the two questions that hasn't been answered for the longest time", async () => {
      const challenges = mockChallenges(13)
      const expectedLetters = [
        marathiAlphabet[marathiAlphabet.length - 1].marathi,
        marathiAlphabet[marathiAlphabet.length - 2].marathi,
      ]

      challenges.push({
        id: 14,
        letter: expectedLetters[0],
        module: 'marathi-to-latin',
        flawless: 0,
        lastActivity: subHours(new Date(), 1),
        attempts: 1,
        mistakes: [],
      })

      challenges.push({
        id: 15,
        letter: expectedLetters[1],
        module: 'marathi-to-latin',
        flawless: 0,
        lastActivity: subHours(new Date(), 2),
        attempts: 1,
        mistakes: [],
      })

      const service = new ExerciseService(new MockProgressService(challenges))
      const exercise = await service.getExercise('test-user', 'marathi-to-latin')

      expect(exercise.letters).toHaveLength(8)
      expect(exercise.letters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marathi: expectedLetters[0] }),
          expect.objectContaining({ marathi: expectedLetters[1] }),
        ])
      )
    })

    it('should skip flawless challenges when they are not the last two', async () => {
      const challenges: ResolvedUserProgress['challenges'] = []
      const expectedLetters = Array.from({ length: 15 }, (_, i) => marathiAlphabet[i].marathi)

      // not flawless today
      Array.from({ length: 5 }, (_, i) => {
        challenges.push(
          createMockChallenge({
            letter: expectedLetters[i],
            flawless: 0,
            lastActivity: new Date(),
          })
        )
      })

      // flawless yesterday
      Array.from({ length: 7 }, (_, i) => {
        challenges.push(
          createMockChallenge({
            letter: expectedLetters[5 + i],
            flawless: 5,
            lastActivity: subDays(new Date(), 1),
          })
        )
      })

      // not flawless two days ago
      Array.from({ length: 3 }, (_, i) => {
        challenges.push(
          createMockChallenge({
            letter: expectedLetters[12 + i],
            flawless: 0,
            lastActivity: subDays(new Date(), 2),
          })
        )
      })

      const service = new ExerciseService(new MockProgressService(challenges))
      const exercise = await service.getExercise('test-user', 'marathi-to-latin')

      expect(exercise.letters).toHaveLength(8)
      expect(exercise.letters).toEqual(
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
      )

      Array.from({ length: 7 }, (_, i) => expectedLetters[5 + i]).forEach(letter => {
        expect(
          exercise.letters,
          `letter ${letter} (${LetterService.getLetter(letter).latin}) should not be in the exercise`
        ).not.toEqual(expect.arrayContaining([expect.objectContaining({ marathi: letter })]))
      })
    })
  })
})

function mockChallenges(amount: number) {
  return Array.from({ length: amount }, (_, i) => createMockChallenge())
}

function createMockChallenge(
  override: Partial<ResolvedUserProgress['challenges'][number]> = {}
): ResolvedUserProgress['challenges'][number] {
  return {
    id: index++,
    module: 'marathi-to-latin',
    attempts: 1,
    mistakes: [],
    flawless: 0,
    lastActivity: new Date(),
    letter: marathiAlphabet[index % marathiAlphabet.length].marathi,
    ...override,
  }
}
