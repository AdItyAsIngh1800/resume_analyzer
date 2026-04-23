import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/auth';
import { FileText, LogOut, Sparkles } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItem = (href: string, label: string) => {
    const active = router.pathname === href || router.pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={[
          'px-3 py-1.5 rounded-lg text-sm transition',
          active ? 'text-brand-700 bg-brand-50' : 'text-gray-600 hover:text-ink hover:bg-gray-100',
        ].join(' ')}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 border-b border-gray-200/70">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-ink hover:no-underline"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-brand text-white shadow-pop">
            <FileText size={16} />
          </span>
          <span>Resume Analyzer</span>
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              {navItem('/dashboard', 'Dashboard')}
              {navItem('/upload', 'Upload')}
              <div className="mx-2 h-6 w-px bg-gray-200" />
              <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-700">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
                <span className="hidden md:inline">{user.name}</span>
                {user.plan === 'pro' && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 ring-1 ring-brand-100 rounded-full px-1.5 py-0.5">
                    <Sparkles size={10} /> Pro
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-error px-2 py-1 rounded-lg hover:bg-red-50"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm text-gray-700 hover:text-ink rounded-lg hover:bg-gray-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="ml-1 px-3 py-1.5 text-sm font-medium bg-gradient-brand text-white rounded-lg shadow-pop hover:brightness-110 hover:no-underline"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
