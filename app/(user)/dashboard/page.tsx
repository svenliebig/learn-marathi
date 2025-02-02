'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/context/auth/auth-context';
import { db } from '@/lib/database';
import { marathiAlphabet } from '@/lib/marathi-data';
import { UserProgress } from '@/lib/types';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { userId, isLoading: authLoading, error: authError } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const totalLetters = marathiAlphabet.length;

  useEffect(() => {
    const loadProgress = async () => {
      if (!userId) return;

      try {
        const userProgress = await db.getUserProgress(userId);
        setProgress(userProgress);

        // Calculate streak
        const today = new Date().toISOString().split('T')[0];
        if (userProgress.lastActivity === today) {
          setStreakDays(userProgress.streakDays || 0);
        } else if (userProgress.lastActivity) {
          const lastDate = new Date(userProgress.lastActivity);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (
            lastDate.toISOString().split('T')[0] ===
            yesterday.toISOString().split('T')[0]
          ) {
            setStreakDays(userProgress.streakDays || 0);
          } else {
            setStreakDays(0);
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [userId]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading your progress...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">
          Authentication error: {authError}
        </div>
      </div>
    );
  }

  const calculateOverallProgress = () => {
    if (!progress?.exercises) return 0;
    const exercises = Object.values(progress.exercises);
    if (exercises.length === 0) return 0;

    const totalLetters = exercises.reduce(
      (acc, ex) => acc + ex.completedLetters.length,
      0
    );

    const targetLetters = exercises.length * 16; // Assuming 16 letters per exercise
    return Math.round((totalLetters / targetLetters) * 100);
  };

  const calculateAccuracy = () => {
    if (!progress?.exercises) return 0;
    let totalAttempts = 0;
    let totalCorrect = 0;

    Object.values(progress.exercises).forEach(exercise => {
      Object.values(exercise.letterStats).forEach(stats => {
        totalAttempts += stats.attempts;
        totalCorrect += stats.correct;
      });
    });

    return totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  };

  const getMasteryLevel = (completedCount: number) => {
    if (completedCount >= 14) return 'Master';
    if (completedCount >= 10) return 'Advanced';
    if (completedCount >= 6) return 'Intermediate';
    if (completedCount >= 2) return 'Beginner';
    return 'Novice';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
          <Link href="/learning">
            <Button className="gap-2">
              Continue Learning <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold">Daily Streak</h3>
                <p className="text-2xl font-bold">{streakDays} days</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Accuracy</h3>
                <p className="text-2xl font-bold">{calculateAccuracy()}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Mastery Level</h3>
                <p className="text-2xl font-bold">
                  {getMasteryLevel(
                    progress?.exercises?.['marathi-to-latin']?.completedLetters
                      .length || 0
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
          <Progress value={calculateOverallProgress()} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {calculateOverallProgress()}% of Marathi alphabet mastered
          </p>
        </Card>

        {/* Exercise Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <h3 className="text-lg font-semibold">Marathi to Latin</h3>
                <p className="text-sm text-muted-foreground">
                  Practice recognizing Marathi letters
                </p>
              </div>
              <Link href="/learning?mode=marathi-to-latin">
                <Button variant="outline" size="sm">
                  Practice
                </Button>
              </Link>
            </div>
            <Progress
              value={
                progress?.exercises?.['marathi-to-latin']?.completedLetters
                  .length ?? 0
              }
              max={totalLetters}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {progress?.exercises?.['marathi-to-latin']?.completedLetters
                .length ?? 0}{' '}
              of {totalLetters} letters mastered
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Trophy className="w-8 h-8 text-primary mb-2" />
                <h3 className="text-lg font-semibold">Latin to Marathi</h3>
                <p className="text-sm text-muted-foreground">
                  Practice writing Marathi letters
                </p>
              </div>
              <Link href="/learning?mode=latin-to-marathi">
                <Button variant="outline" size="sm">
                  Practice
                </Button>
              </Link>
            </div>
            <Progress
              value={
                progress?.exercises?.['latin-to-marathi']?.completedLetters
                  .length ?? 0
              }
              max={totalLetters}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {progress?.exercises?.['latin-to-marathi']?.completedLetters
                .length ?? 0}{' '}
              of {totalLetters} letters mastered
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {progress && Object.keys(progress.exercises).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(progress.exercises).map(([mode, data]) => (
                <div key={mode} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{mode}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.completedLetters.length} letters mastered
                    </p>
                  </div>
                  <Link href={`/learning?mode=${mode}`}>
                    <Button variant="ghost" size="sm">
                      Continue
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No recent activity. Start learning now!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
