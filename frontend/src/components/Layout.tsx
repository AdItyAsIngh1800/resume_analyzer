import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 animate-fade-in-up">
        {children}
      </main>
      <footer className="border-t border-gray-200/70 py-6 text-center text-xs text-gray-500">
        Resume Analyzer · Built with Next.js, Express, MongoDB, and a local Ollama model.
      </footer>
    </div>
  );
}
