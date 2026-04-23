import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingScreen } from '@/components/Loading';
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
      <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (!matches) return <LoadingScreen label="Finding matching jobs..." />;

  return (
    <div>
      <Link
        href={`/resumes/${id}`}
        className="inline-flex items-center gap-1 text-sm mb-4"
      >
        <ArrowLeft size={14} /> Back to analysis
      </Link>
      <h1 className="text-2xl font-bold mb-1">Job matches</h1>
      <p className="text-gray-600 text-sm mb-6">
        Top {matches.length} jobs ranked by how well your skills align.
      </p>

      {matches.length === 0 ? (
        <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600">No matching jobs found. Try re-analyzing with an updated resume.</p>
        </div>
      ) : (
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
