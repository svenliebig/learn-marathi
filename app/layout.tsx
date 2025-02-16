import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Github } from 'lucide-react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Learning Marathi',
  description: 'Learn Marathi with our interactive learning platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'relative')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>
          {children}
          <div className="pb-10" />
          <div className="absolute bottom-4 left-4 z-10">
            <Link
              href="https://github.com/svenliebig/learn-marathi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub Profile</span>
            </Link>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
