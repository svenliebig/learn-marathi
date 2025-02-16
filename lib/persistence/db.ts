import { hash } from 'bcrypt';
import { ChallengePersistence, DatabaseInterface } from './types';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, Tables, TablesInsert, TablesUpdate } from './supabase';

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

class SQLiteDatabase implements DatabaseInterface, ChallengePersistence {
  private db: ReturnType<typeof createClient> | null = null;

  private async getDb() {
    if (!this.db) {
      this.db = createClient(cookies());
    }
    return this.db;
  }

  async addMistake(challengeId: number, answer: string): Promise<{ success: boolean; error: any }> {
    console.log('[DB] addMistake', { challengeId, answer });

    const db = await this.getDb();
    const { error } = await db.from('mistakes').insert({
      challenge: challengeId,
      answer,
    });

    if (error) {
      console.error('Error adding mistake:', error);
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      error,
    };
  }

  async getUser(email: string): Promise<Tables<'users'> | null> {
    const db = await this.getDb();
    const {
      data: user,
      error,
      status,
    } = await db.from('users').select('*').eq('email', email).single();

    if (error) {
      console.error('Error getting user:', error);
    }

    return user
      ? {
          id: user.id,
          email: user.email,
          password: user.password,
          created_at: user.created_at,
        }
      : null;
  }

  async saveUser(user: Tables<'users'>): Promise<void> {
    const db = await this.getDb();
    const { error } = await db.from('users').insert({
      id: user.id,
      email: user.email,
      password: user.password,
      created_at: user.created_at,
    });

    if (error) {
      console.error('Error saving user:', error);
    }
  }

  async getUserProgress(userId: string): Promise<Tables<'user_progress'>> {
    const db = await this.getDb();
    const { data: progress, error } = await db
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting user progress:', error);
    }

    if (!progress) {
      throw new Error('User progress not found');
    }

    return {
      id: progress.id,
      user_id: progress.user_id,
      exercises: progress.exercises,
      streak_days: progress.streak_days ?? 0,
      last_activity: progress.last_activity ?? null,
    };
  }

  async updateUserProgress(userId: string, progress: TablesUpdate<'user_progress'>): Promise<void> {
    const db = await this.getDb();
    const { error, status, statusText } = await db
      .from('user_progress')
      .update({
        exercises: progress.exercises,
        streak_days: progress.streak_days,
        last_activity: progress.last_activity,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user progress:', error);
    }
  }

  async insertChallenge(
    userProgressId: number,
    challenge: TablesInsert<'challenges'>
  ): Promise<Tables<'challenges'>> {
    console.log('[DB] inderChallenge', { userProgressId, challenge });

    const db = await this.getDb();
    const { error, data, status, statusText, count } = await db
      .from('challenges')
      .insert(challenge)
      .select();

    if (error) {
      console.error('[DB] Error inserting challenge:', error);
    }

    console.log('[DB] Insert challenge response', { status, statusText, count });

    if (!data) {
      console.error('[DB] Challenge not found');
      throw new Error('Challenge not found');
    }

    if (data.length > 1) {
      console.error('[DB] Multiple challenges found');
      throw new Error('Multiple challenges found');
    }

    console.log('[DB] Challenge inserted', data[0]);
    return data[0];
  }

  async updateChallenge(
    userProgressId: number,
    challenge: TablesUpdate<'challenges'>
  ): Promise<Tables<'challenges'>> {
    console.log('[DB] updateChallenge', { userProgressId, challenge });

    const db = await this.getDb();
    const { error, data, status, statusText, count } = await db
      .from('challenges')
      .update({
        attempts: challenge.attempts,
        letter: challenge.letter,
      })
      .eq('user_progress_id', userProgressId)
      .eq('letter', challenge.letter!)
      .select();

    if (error) {
      console.error('[DB] Error updating challenge:', error);
      throw error;
    }

    console.log('[DB] Update challenge response', { status, statusText, count });

    if (!data) {
      console.error('[DB] Challenge not found');
      throw new Error('Challenge not found');
    }

    if (data.length > 1) {
      console.error('[DB] Multiple challenges found');
      throw new Error('Multiple challenges found');
    }

    console.log('[DB] Challenge updated', data[0]);
    return data[0];
  }

  async getChallenge(userProgressId: number, letter: string): Promise<Tables<'challenges'> | null> {
    console.log('[DB] getChallenge', { userProgressId, letter });

    const db = await this.getDb();

    const { data, error } = await db
      .from('challenges')
      .select('*')
      .eq('user_progress_id', userProgressId)
      .eq('letter', letter)
      .maybeSingle();

    if (error) {
      console.error('[DB] Error getting challenge:', error);
    }

    return data;
  }

  // Helper methods for auth
  async createUser(email: string, password: string): Promise<{ id: string; email: string }> {
    const hashedPassword = await hash(password, 10);
    const id = crypto.randomUUID();
    const user: Tables<'users'> = {
      id,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    };

    await this.saveUser(user);
    await this.updateUserProgress(user.id, {
      exercises: '{}',
      streak_days: 0,
      last_activity: null,
      user_id: user.id,
    });

    return { id, email };
  }
}

export const db = new SQLiteDatabase();
