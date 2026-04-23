import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingScreen } from '@/components/Loading';
import { api, apiErrorMessage } from '@/utils/api';
import { useAuth } from '@/store/auth';
import type { Resume } from '@/types';

function DashboardInner() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ resumes: Resume[] }>('/resumes');
        setResumes(data.resumes);
      } catch (err) {
        setError(apiErrorMessage(err));
      }
    })();
  }, []);

  if (resumes === null && !error) return <LoadingScreen label="Loading your resumes..." />;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">
            Plan: <span className="font-medium capitalize">{user?.plan}</span> · Analyses used:{' '}
            <span className="font-medium">{user?.analysisCount ?? 0}</span>
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded no-underline hover:opacity-90 hover:no-underline"
        >
          <Plus size={16} /> New analysis
        </Link>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-error">{error}</div>}

      {resumes && resumes.length === 0 && (
        <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
          <FileText className="mx-auto text-gray-400" size={40} />
          <p className="mt-3 font-medium">No resumes yet</p>
          <p className="text-sm text-gray-500 mt-1">Upload a resume to see your analysis here.</p>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <ul className="space-y-3">
          {resumes.map((r) => (
            <li key={r._id}>
              <Link
                href={`/resumes/${r._id}`}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-primary no-underline hover:no-underline"
              >
                <FileText className="text-primary" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{r.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()} · {(r.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    r.status === 'analyzed'
                      ? 'bg-green-100 text-green-700'
                      : r.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {r.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}
