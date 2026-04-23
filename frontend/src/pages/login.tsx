import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const next = typeof router.query.next === 'string' ? router.query.next : '/dashboard';
      router.push(next);
    } catch {
      /* error surfaced via store */
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-ink tracking-tight">Welcome back</h1>
        <p className="text-gray-600 mt-1">Sign in to keep analyzing your resume.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-7">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 ring-1 ring-red-100 text-sm text-red-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            <LogIn size={16} /> Sign in
          </Button>
        </form>
      </div>
      <p className="text-sm text-gray-600 mt-5 text-center">
        No account?{' '}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>
    </div>
  );
}
