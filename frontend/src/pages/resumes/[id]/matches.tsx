import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Target } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Skeleton } from '@/components/ui/Skeleton';
import { JobCard } from '@/components/JobCard';
import { api, apiErrorMessage } from '@/utils/api';
import type { JobMatch } from '@/types';

function MatchesInner() {
  const router = useRouter();
  const { id } = router.query;
  const [matches, setMatches] = useState<JobMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    (async () => {
      try {
        const { data } = await api.get<{ matches: JobMatch[] }>(`/resumes/${id}/matches`);
        setMatches(data.matches);
      } catch (err) {
        setError(apiErrorMessage(err));
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-5 rounded-2xl bg-red-50 ring-1 ring-red-100 flex items-start gap-3 text-red-700">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-sm">{error}</p>
          <Link href={`/resumes/${id}`} className="text-xs underline mt-2 inline-block">← Back to analysis</Link>
        </div>
      </div>
    );
  }

  const avg = matches && matches.length > 0
    ? Math.round(matches.reduce((acc, m) => acc + m.matchPercentage, 0) / matches.length)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/resumes/${id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600"
        >
          <ArrowLeft size={14} /> Back to analysis
        </Link>
        <h1 className="text-3xl font-bold text-ink tracking-tight mt-2">Job matches</h1>
        <p className="text-gray-600 text-sm mt-1">
          {matches === null
            ? 'Ranking jobs by how well your skills align…'
            : `Top ${matches.length} jobs ranked by skill overlap${avg !== null ? ` · average match ${avg}%` : ''}.`}
        </p>
      </div>

      {matches === null && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-start gap-4">
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Skeleton className="h-[72px] w-[72px] rounded-full" />
            </div>
          ))}
        </div>
      )}

      {matches && matches.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center shadow-card">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Target size={24} />
          </div>
          <p className="mt-4 font-semibold text-ink">No matching jobs yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Try re-analyzing with an updated resume, or seed more jobs into the database.
          </p>
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((m) => (
            <JobCard key={m.job._id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <ProtectedRoute>
      <MatchesInner />
    </ProtectedRoute>
  );
}
