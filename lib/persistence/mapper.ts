import { Challenge, FullUserProgress, Mistake, UserProgress } from '../services/progress/types';
import { db } from './db';
import { Tables } from './supabase';

const userProgress = {
  toModel: (data: Tables<'user_progress'>): UserProgress => {
    return {
      id: data.id,
      userId: data.user_id,
      lastActivity: data.last_activity ? new Date(data.last_activity) : null,
      streak: data.streak_days ?? 0,
      exercises: JSON.parse(data.exercises),
    };
  },
  fullToModel: (data: Awaited<ReturnType<typeof db.getFullUserProgress>>): FullUserProgress => {
    return {
      id: data.id,
      userId: data.user_id,
      lastActivity: data.last_activity ? new Date(data.last_activity) : null,
      streak: data.streak_days ?? 0,
      challenges: data.challenges.map(challenge.toModel),
    };
  },
  toPersistence: (model: UserProgress): Tables<'user_progress'> => {
    return {
      id: model.id,
      user_id: model.userId,
      last_activity: model.lastActivity?.toISOString() ?? null,
      streak_days: model.streak,
      exercises: JSON.stringify(model.exercises),
    };
  },
};

const challenge = {
  toModel: (data: Tables<'challenges'> & { mistakes?: Tables<'mistakes'>[] }): Challenge => {
    return {
      id: data.id,
      letter: data.letter,
      module: data.module_id,
      attempts: data.attempts ?? 0,
      flawless: data.flawless ?? 0,
      lastActivity: new Date(data.updated_at),
      mistakes: data.mistakes?.map(mistake.toModel) ?? [],
    };
  },
};

const mistake = {
  toModel: (data: Tables<'mistakes'>): Mistake => {
    return {
      id: data.id,
      answer: data.answer,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };
  },
};

export const persistenceMapper = {
  userProgress,
  challenge,
  mistake,
};
