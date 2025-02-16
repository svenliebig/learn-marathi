import { Tables } from './supabase';

// Database Interface
export interface DatabaseInterface {
  getUser(email: string): Promise<Tables<'users'> | null>;
  saveUser(user: Tables<'users'>): Promise<void>;
  updateUserProgress(userId: string, progress: Tables<'user_progress'>): Promise<void>;
  getUserProgress(userId: string): Promise<Tables<'user_progress'>>;
}

export interface User {
  id: string;
  email: string;

  /**
   * Hashed password
   */
  password: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  type: 'streak' | 'mastery' | 'accuracy' | 'speed';
}
