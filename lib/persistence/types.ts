import { Tables } from './supabase';

// Database Interface
export interface DatabaseInterface {
  getUser(email: string): Promise<Tables<'users'> | null>;
  saveUser(user: Tables<'users'>): Promise<void>;
  updateUserProgress(userId: string, progress: Tables<'user_progress'>): Promise<void>;
  getUserProgress(userId: string): Promise<Tables<'user_progress'>>;
}
