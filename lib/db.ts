import { compare, hash } from 'bcrypt';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

let db: any = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    await db.exec(`
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
  return db;
}

export async function createUser(email: string, password: string) {
  const db = await getDb();
  const hashedPassword = await hash(password, 10);
  const id = crypto.randomUUID();

  console.log(db, 'hello👋🏻 ');

  try {
    await db.run(
      'INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)',
      [id, email, hashedPassword, new Date().toISOString()]
    );

    await db.run(
      'INSERT INTO user_progress (user_id, exercises) VALUES (?, ?)',
      [id, JSON.stringify({})]
    );

    return { id, email };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function verifyUser(email: string, password: string) {
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

  if (!user) {
    return null;
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    return null;
  }

  return { id: user.id, email: user.email };
}

export async function getUserProgress(userId: string) {
  const db = await getDb();
  const progress = await db.get(
    'SELECT * FROM user_progress WHERE user_id = ?',
    [userId]
  );

  if (!progress) {
    return null;
  }

  return {
    ...progress,
    exercises: JSON.parse(progress.exercises),
    achievements: progress.achievements
      ? JSON.parse(progress.achievements)
      : [],
  };
}

export async function updateUserProgress(userId: string, progress: any) {
  const db = await getDb();
  await db.run(
    `UPDATE user_progress 
     SET exercises = ?, streak_days = ?, last_activity = ?, 
         total_practice_time = ?, achievements = ?
     WHERE user_id = ?`,
    [
      JSON.stringify(progress.exercises),
      progress.streakDays,
      progress.lastActivity,
      progress.totalPracticeTime,
      JSON.stringify(progress.achievements),
      userId,
    ]
  );
}
