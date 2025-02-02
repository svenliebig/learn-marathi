import { AuthProvider } from '@/lib/context/auth/auth-context';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
