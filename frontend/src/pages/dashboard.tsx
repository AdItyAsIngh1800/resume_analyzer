import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SkeletonList } from '@/components/ui/Skeleton';
import { LinkButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, apiErrorMessage } from '@/utils/api';
import { useAuth } from '@/store/auth';
import type { Resume } from '@/types';

const statusTone: Record<string, { tone: 'success' | 'danger' | 'neutral'; label: string }> = {
  analyzed: { tone: 'success', label: 'Analyzed' },
  error:    { tone: 'danger',  label: 'Error' },
  uploaded: { tone: 'neutral', label: 'Uploaded' },
};

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="text-gray-600 mt-1 text-sm flex items-center gap-3">
            <Badge tone={user?.plan === 'pro' ? 'brand' : 'neutral'}>{user?.plan ?? 'free'} plan</Badge>
            <span className="text-gray-500">
              {user?.analysisCount ?? 0} analyses used
            </span>
          </p>
        </div>
        <LinkButton href="/upload">
          <Plus size={16} /> New analysis
        </LinkButton>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 ring-1 ring-red-100 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {resumes === null && !error && <SkeletonList rows={3} />}

      {resumes && resumes.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center shadow-card">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <p className="mt-4 font-semibold text-ink">No resumes yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Upload your first resume to get an AI-powered ATS score and matching jobs.
          </p>
          <div className="mt-5">
            <LinkButton href="/upload">
              <Plus size={16} /> Upload your first resume
            </LinkButton>
          </div>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <ul className="space-y-2.5">
          {resumes.map((r) => {
            const s = statusTone[r.status] ?? statusTone.uploaded;
            return (
              <li key={r._id}>
                <Link
                  href={`/resumes/${r._id}`}
                  className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-card-hover hover:border-brand-200 transition hover:no-underline"
                >
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-gradient-brand group-hover:text-white transition">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{r.fileName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <Clock size={11} />
                      {new Date(r.createdAt).toLocaleString()}
                      <span>·</span>
                      <span>{(r.fileSize / 1024).toFixed(1)} KB</span>
                    </p>
                  </div>
                  <Badge tone={s.tone}>{s.label}</Badge>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-500 transition" />
                </Link>
              </li>
            );
          })}
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
