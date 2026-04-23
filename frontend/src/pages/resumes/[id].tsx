import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Download, Target, CheckCircle2, AlertTriangle, Lightbulb,
  ChevronRight, AlertCircle, ArrowUpRight, Sparkles, BookOpen,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LinkButton, Button } from '@/components/ui/Button';
import { ATSScore } from '@/components/ATSScore';
import { SkillsByCategory } from '@/components/SkillCard';
import { api, apiErrorMessage, getToken } from '@/utils/api';
import type { Analysis } from '@/types';

const impactTone: Record<string, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger', medium: 'warning', low: 'neutral',
};
const importanceTone: Record<string, 'danger' | 'warning' | 'neutral'> = {
  critical: 'danger', recommended: 'warning', nice_to_have: 'neutral', 'nice-to-have': 'neutral',
};

function ResultsInner() {
  const router = useRouter();
  const { id } = router.query;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resumes/${id}/report`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analysis-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="p-5 rounded-2xl bg-red-50 ring-1 ring-red-100 flex items-start gap-3 text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">{error}</p>
            <Link href="/dashboard" className="text-xs inline-flex items-center gap-1 mt-2 text-red-700 underline">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return <SkeletonCard />;

  const skillCount = analysis.skills?.length ?? 0;
  const improvementCount = analysis.improvements?.length ?? 0;
  const missingCount = analysis.missingSkills?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-brand-600 inline-flex items-center gap-1">
            Dashboard <ChevronRight size={12} /> <span className="text-ink">Analysis</span>
          </Link>
          <h1 className="text-3xl font-bold text-ink tracking-tight mt-1">Analysis results</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated {new Date(analysis.createdAt).toLocaleString()}
            {analysis.modelUsed && <> · <span className="font-mono text-xs">{analysis.modelUsed}</span></>}
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/resumes/${id}/matches`}>
            <Target size={16} /> Job matches <ArrowUpRight size={14} />
          </LinkButton>
          <Button variant="secondary" onClick={downloadReport} loading={downloading}>
            <Download size={16} /> PDF report
          </Button>
        </div>
      </div>

      {/* Hero — ATS score + summary */}
      <Card className="bg-gradient-to-br from-white via-white to-brand-50/40 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-100/50 blur-3xl pointer-events-none" />
        <div className="relative">
          <ATSScore score={analysis.atsScore} />
          {(analysis.overallSummary || analysis.summary) && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                Overall summary
              </div>
              <p className="text-gray-700 leading-relaxed">{analysis.overallSummary || analysis.summary}</p>
            </div>
          )}
          {analysis.atsFeedback && (
            <div className="mt-3 text-sm text-gray-600 italic">{analysis.atsFeedback}</div>
          )}
        </div>
      </Card>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Skills extracted',     value: skillCount,       tone: 'brand'   as const, icon: Sparkles },
          { label: 'Improvement areas',    value: improvementCount, tone: 'warning' as const, icon: Lightbulb },
          { label: 'Skills to learn',      value: missingCount,     tone: 'info'    as const, icon: BookOpen },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <div className="flex items-center gap-2">
              <Badge tone={stat.tone}><stat.icon size={10} /></Badge>
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                {stat.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-ink mt-1.5">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid md:grid-cols-2 gap-5">
        {analysis.strengths?.length > 0 && (
          <Card className="border-l-4 border-l-emerald-400">
            <CardHeader
              title="Strengths"
              icon={<CheckCircle2 className="text-emerald-500" size={18} />}
            />
            <ul className="space-y-2.5">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {analysis.weaknesses?.length > 0 && (
          <Card className="border-l-4 border-l-amber-400">
            <CardHeader
              title="Weaknesses"
              icon={<AlertTriangle className="text-amber-500" size={18} />}
            />
            <ul className="space-y-2.5">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Improvements */}
      {analysis.improvements?.length > 0 && (
        <Card>
          <CardHeader
            title="Actionable improvements"
            icon={<Lightbulb className="text-amber-500" size={18} />}
            subtitle="Ranked by impact on your ATS + recruiter appeal"
          />
          <div className="space-y-2.5">
            {analysis.improvements.map((imp, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-brand text-white text-sm font-semibold flex items-center justify-center shadow-pop">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-ink">{imp.area}</span>
                    <Badge tone={impactTone[imp.impact] ?? 'neutral'}>{imp.impact} impact</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{imp.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Skills */}
      <Card>
        <CardHeader
          title="Extracted skills"
          icon={<Sparkles className="text-brand-500" size={18} />}
          subtitle={`${skillCount} skills across ${
            new Set((analysis.skills ?? []).map((s) => s.category)).size
          } categories`}
        />
        <SkillsByCategory skills={analysis.skills} />
      </Card>

      {/* Missing skills */}
      {analysis.missingSkills?.length > 0 && (
        <Card>
          <CardHeader
            title="Recommended skills to learn"
            icon={<BookOpen className="text-sky-500" size={18} />}
            subtitle="Filling these gaps unlocks more job matches"
          />
          <div className="grid sm:grid-cols-2 gap-2.5">
            {analysis.missingSkills.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-brand-200 transition"
              >
                <div className="shrink-0">
                  <Badge tone={importanceTone[m.importance] ?? 'neutral'}>{m.importance.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink">{m.name}</p>
                  {m.reason && <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{m.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
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
