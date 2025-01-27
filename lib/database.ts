import { DatabaseInterface, User, UserProgress } from './types';

class LocalStorageDatabase implements DatabaseInterface {
  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async getUser(email: string): Promise<User | null> {
    const users = this.getItem<User[]>('users') || [];
    return users.find(u => u.email === email) || null;
  }

  async saveUser(user: User): Promise<void> {
    const users = this.getItem<User[]>('users') || [];
    const existingIndex = users.findIndex(u => u.id === user.id);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    this.setItem('users', users);
  }

  async updateUserProgress(
    userId: string,
    progress: UserProgress
  ): Promise<void> {
    const progressKey = `progress_${userId}`;

    // Update last activity and streak
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastActivity !== today) {
      const lastDate = progress.lastActivity
        ? new Date(progress.lastActivity)
        : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastDate &&
        lastDate.toISOString().split('T')[0] ===
          yesterday.toISOString().split('T')[0]
      ) {
        progress.streakDays = (progress.streakDays || 0) + 1;
      } else if (!lastDate || lastDate.toISOString().split('T')[0] !== today) {
        progress.streakDays = 1;
      }

      progress.lastActivity = today;
    }

    this.setItem(progressKey, progress);
  }

  async getUserProgress(userId: string): Promise<UserProgress> {
    const progressKey = `progress_${userId}`;
    return (
      this.getItem<UserProgress>(progressKey) || {
        userId,
        exercises: {},
        streakDays: 0,
      }
    );
  }
}

export const db = new LocalStorageDatabase();
