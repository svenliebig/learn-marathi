import { Tables, TablesInsert, TablesUpdate } from './supabase';

// Database Interface
export interface DatabaseInterface {
  getUser(email: string): Promise<Tables<'users'> | null>;
  saveUser(user: Tables<'users'>): Promise<void>;
  updateUserProgress(userId: string, progress: Tables<'user_progress'>): Promise<void>;
  getUserProgress(userId: string): Promise<Tables<'user_progress'>>;
}

export interface ChallengePersistence {
  insertChallenge(
    userProgressId: number,
    challenge: TablesInsert<'challenges'>
  ): Promise<Tables<'challenges'>>;

  updateChallenge(
    userProgressId: number,
    challenge: TablesUpdate<'challenges'>
  ): Promise<Tables<'challenges'>>;

  getChallenge(userProgressId: number, letter: string): Promise<Tables<'challenges'> | null>;
}
