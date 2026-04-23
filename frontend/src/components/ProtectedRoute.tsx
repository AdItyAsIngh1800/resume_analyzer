import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/auth';
import { LoadingScreen } from './Loading';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !user) {
      router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [initialized, user, router]);

  if (!initialized || !user) return <LoadingScreen />;
  return <>{children}</>;
}
