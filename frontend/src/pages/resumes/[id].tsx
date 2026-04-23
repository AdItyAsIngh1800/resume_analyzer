import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Download, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingScreen } from '@/components/Loading';
import { ATSScore } from '@/components/ATSScore';
import { SkillsByCategory } from '@/components/SkillCard';
import { api, apiErrorMessage, getToken } from '@/utils/api';
import type { Analysis } from '@/types';

const impactColor: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-gray-50 text-gray-700 border-gray-200',
};

const importanceColor: Record<string, string> = {
  critical: 'bg-red-50 text-red-700',
  recommended: 'bg-yellow-50 text-yellow-700',
  'nice-to-have': 'bg-gray-50 text-gray-700',
};

function ResultsInner() {
  const router = useRouter();
  const { id } = router.query;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    (async () => {
      try {
        const { data } = await api.get<{ analysis: Analysis }>(`/resumes/${id}/analysis`);
        setAnalysis(data.analysis);
      } catch (err) {
        setError(apiErrorMessage(err));
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded">
        <p className="text-error">{error}</p>
        <Link href="/dashboard" className="text-sm mt-2 inline-block">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!analysis) return <LoadingScreen label="Loading analysis..." />;

  const reportUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/resumes/${id}/report`;
  const downloadReport = async () => {
    try {
      const response = await fetch(reportUrl, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analysis results</h1>
          <p className="text-sm text-gray-500">
            Generated {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/resumes/${id}/matches`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded no-underline hover:opacity-90 hover:no-underline"
          >
            <Target size={16} /> View job matches
          </Link>
          <button
            onClick={downloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            <Download size={16} /> PDF report
          </button>
        </div>
      </div>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <ATSScore score={analysis.atsScore} />
        {analysis.summary && <p className="mt-6 text-gray-700">{analysis.summary}</p>}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {analysis.strengths?.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-success" size={18} /> Strengths
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-success">•</span> {s}
                </li>
              ))}
            </ul>
          </section>
        )}
        {analysis.weaknesses?.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <AlertTriangle className="text-warning" size={18} /> Weaknesses
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-warning">•</span> {w}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {analysis.improvements?.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Actionable improvements</h2>
          <div className="space-y-3">
            {analysis.improvements.map((imp, i) => (
              <div key={i} className={`border rounded p-3 ${impactColor[imp.impact] || ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{imp.area}</span>
                  <span className="text-xs uppercase tracking-wide">{imp.impact}</span>
                </div>
                <p className="text-sm mt-1">{imp.suggestion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Extracted skills</h2>
        <SkillsByCategory skills={analysis.skills} />
      </section>

      {analysis.missingSkills?.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Recommended skills to learn</h2>
          <div className="space-y-2">
            {analysis.missingSkills.map((m, i) => (
              <div key={i} className="flex items-start gap-3 border-b last:border-0 border-gray-100 pb-2">
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded ${
                    importanceColor[m.importance] || 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {m.importance}
                </span>
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-gray-600">{m.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ResumeResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsInner />
    </ProtectedRoute>
  );
}
