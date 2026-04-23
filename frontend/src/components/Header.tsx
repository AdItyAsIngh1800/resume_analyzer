import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/auth';
import { FileText, LogOut, User as UserIcon } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 no-underline hover:no-underline">
          <FileText className="text-primary" size={20} />
          <span>Resume Analyzer</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/upload">Upload</Link>
              <span className="flex items-center gap-1 text-gray-700 border-l pl-4">
                <UserIcon size={14} /> {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-600 hover:text-error"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-primary text-white rounded no-underline hover:opacity-90 hover:no-underline"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
