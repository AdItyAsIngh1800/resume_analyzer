import type { JobMatch } from '@/types';
import { MapPin, Briefcase, DollarSign, Check, X } from 'lucide-react';

function matchStyle(pct: number) {
  if (pct >= 75) return { ring: 'stroke-emerald-500', text: 'text-emerald-600', dotBg: 'bg-emerald-500' };
  if (pct >= 50) return { ring: 'stroke-amber-500',   text: 'text-amber-600',   dotBg: 'bg-amber-500' };
  return             { ring: 'stroke-gray-300',    text: 'text-gray-500',    dotBg: 'bg-gray-400' };
}

function MatchRing({ pct }: { pct: number }) {
  const { ring, text } = matchStyle(pct);
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative shrink-0 w-[72px] h-[72px]">
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
        <circle cx="36" cy="36" r={r} stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r={r} strokeWidth="6" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          className={ring}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-base font-bold ${text}`}>{Math.round(pct)}%</span>
        <span className="text-[9px] uppercase tracking-wider text-gray-500">match</span>
      </div>
    </div>
  );
}

export function JobCard({ match }: { match: JobMatch }) {
  const { job, matchPercentage, matchedSkills, missingSkills } = match;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-brand-200 p-5 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink truncate">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {job.location} · {job.workModel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase size={12} /> {job.type} · {job.level}
            </span>
            {job.salaryRange?.min && (
              <span className="inline-flex items-center gap-1">
                <DollarSign size={12} />
                {(job.salaryRange.min / 1000).toFixed(0)}k–{(job.salaryRange.max / 1000).toFixed(0)}k
              </span>
            )}
          </div>
        </div>
        <MatchRing pct={matchPercentage} />
      </div>

      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {matchedSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1 mb-1.5">
                <Check size={12} /> Matched · {matchedSkills.length}
              </div>
              <div className="flex flex-wrap gap-1">
                {matchedSkills.slice(0, 8).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missingSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-red-700 flex items-center gap-1 mb-1.5">
                <X size={12} /> Missing · {missingSkills.length}
              </div>
              <div className="flex flex-wrap gap-1">
                {missingSkills.slice(0, 6).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-100 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
