import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Trophy, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-primary/10">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6">Learn Marathi with Joy</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master the Marathi alphabet through interactive exercises and track
            your progress with our innovative learning platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/get-started">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <BookOpen className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Interactive Learning
              </h3>
              <p className="text-muted-foreground">
                Learn through engaging exercises with immediate feedback and
                progress tracking.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Trophy className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your learning journey with detailed statistics and
                achievements.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-muted-foreground">
                Join a community of learners and share your progress with
                others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">Simple Pricing</h2>
          <div className="max-w-md mx-auto p-8 rounded-lg bg-card border shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
            <p className="text-3xl font-bold mb-6">$0</p>
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Full access to all exercises
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Progress tracking
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Community support
              </li>
            </ul>
            <Link href="/get-started">
              <Button className="w-full">Start Learning Now</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
