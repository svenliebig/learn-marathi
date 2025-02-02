import { hash } from 'bcrypt';
import { DatabaseInterface, User, UserProgress } from './types';

import { createServerClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from './supabase';

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

class SQLiteDatabase implements DatabaseInterface {
  private db: SupabaseClient<Database, 'public', any> | null = null;

  private async getDb() {
    if (!this.db) {
      this.db = createClient(cookies());
    }
    return this.db;
  }

  async getUser(email: string): Promise<User | null> {
    const db = await this.getDb();
    const {
      data: user,
      error,
      status,
    } = await db.from('users').select('*').eq('email', email).single();
    return user
      ? {
          id: user.id,
          email: user.email,
          password: user.password,
          createdAt: user.created_at,
        }
      : null;
  }

  async saveUser(user: User): Promise<void> {
    const db = await this.getDb();
    await db.from('users').insert({
      id: user.id,
      email: user.email,
      password: user.password,
      created_at: user.createdAt,
    });
  }

  async getUserProgress(userId: string): Promise<UserProgress> {
    const db = await this.getDb();
    const {
      data: progress,
      error,
      status,
    } = await db
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!progress) {
      return {
        userId,
        exercises: {},
        streakDays: 0,
      };
    }

    return {
      userId: progress.user_id,
      exercises: JSON.parse(progress.exercises),
      streakDays: progress.streak_days,
      lastActivity: progress.last_activity,
      totalPracticeTime: progress.total_practice_time,
      achievements: progress.achievements
        ? JSON.parse(progress.achievements)
        : [],
    };
  }

  async updateUserProgress(
    userId: string,
    progress: UserProgress
  ): Promise<void> {
    const db = await this.getDb();
    await db.from('user_progress').insert({
      user_id: userId,
      exercises: JSON.stringify(progress.exercises),
      streak_days: progress.streakDays,
      last_activity: progress.lastActivity,
      total_practice_time: progress.totalPracticeTime,
      achievements: JSON.stringify(progress.achievements),
    });
  }

  // Helper methods for auth
  async createUser(
    email: string,
    password: string
  ): Promise<{ id: string; email: string }> {
    const hashedPassword = await hash(password, 10);
    const id = crypto.randomUUID();
    const user: User = {
      id,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await this.saveUser(user);
    await this.updateUserProgress(id, {
      userId: id,
      exercises: {},
      streakDays: 0,
    });

    return { id, email };
  }
}

export const db = new SQLiteDatabase();
