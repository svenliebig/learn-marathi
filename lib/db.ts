import { compare, hash } from 'bcrypt';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { DatabaseInterface, User, UserProgress } from './types';

class SQLiteDatabase implements DatabaseInterface {
  private db: any = null;

  private async getDb() {
    if (!this.db) {
      this.db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database,
      });

      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_progress (
          user_id TEXT PRIMARY KEY,
          exercises TEXT NOT NULL,
          streak_days INTEGER DEFAULT 0,
          last_activity TEXT,
          total_practice_time INTEGER DEFAULT 0,
          achievements TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `);
    }
    return this.db;
  }

  async getUser(email: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
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
    await db.run(
      'INSERT OR REPLACE INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)',
      [user.id, user.email, user.password, user.createdAt]
    );
  }

  async getUserProgress(userId: string): Promise<UserProgress> {
    const db = await this.getDb();
    const progress = await db.get(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [userId]
    );

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
    await db.run(
      `INSERT OR REPLACE INTO user_progress 
       (user_id, exercises, streak_days, last_activity, total_practice_time, achievements)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify(progress.exercises),
        progress.streakDays,
        progress.lastActivity,
        progress.totalPracticeTime,
        JSON.stringify(progress.achievements),
      ]
    );
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

  // TODO should be a service method
  async verifyUser(
    email: string,
    password: string
  ): Promise<{ id: string; email: string } | null> {
    const user = await this.getUser(email);
    if (!user) return null;

    const isValid = await compare(password, user.password);
    if (!isValid) return null;

    return { id: user.id, email: user.email };
  }
}

export const db = new SQLiteDatabase();
