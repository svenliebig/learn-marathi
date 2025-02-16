import { UserProgress } from '../services/progress/types';
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

export const persistenceMapper = {
  userProgress,
};
