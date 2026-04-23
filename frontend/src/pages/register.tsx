import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      router.push('/upload');
    } catch {
      /* error surfaced via store */
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-ink tracking-tight">Create your account</h1>
        <p className="text-gray-600 mt-1">Free tier — 3 analyses to try it out.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-7">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Ada Lovelace"
          />
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
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            hint="Minimum 8 characters. Choose something memorable but hard to guess."
          />
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 ring-1 ring-red-100 text-sm text-red-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            <UserPlus size={16} /> Create account
          </Button>
        </form>
      </div>
      <p className="text-sm text-gray-600 mt-5 text-center">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
