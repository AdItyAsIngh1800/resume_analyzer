import type { JobMatch } from '@/types';
import { MapPin, Briefcase, TrendingUp } from 'lucide-react';

function matchColor(pct: number) {
  if (pct >= 75) return 'text-success border-success';
  if (pct >= 50) return 'text-warning border-warning';
  return 'text-gray-500 border-gray-300';
}

export function JobCard({ match }: { match: JobMatch }) {
  const { job, matchPercentage, matchedSkills, missingSkills } = match;
  const colorClass = matchColor(matchPercentage);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {job.location} · {job.workModel}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={12} /> {job.type} · {job.level}
            </span>
            {job.salaryRange && (
              <span className="flex items-center gap-1">
                <TrendingUp size={12} /> ${job.salaryRange.min.toLocaleString()} – $
                {job.salaryRange.max.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className={`shrink-0 rounded-full border-2 w-16 h-16 flex items-center justify-center ${colorClass}`}>
          <div className="text-center">
            <div className="text-lg font-bold">{Math.round(matchPercentage)}%</div>
            <div className="text-[10px] uppercase tracking-wide">match</div>
          </div>
        </div>
      </div>

      {matchedSkills.length > 0 && (
        <div className="mt-3">
          <span className="text-xs text-gray-500 mr-2">Matched:</span>
          {matchedSkills.slice(0, 8).map((s) => (
            <span key={s} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs">
              {s}
            </span>
          ))}
        </div>
      )}

      {missingSkills.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-gray-500 mr-2">Missing:</span>
          {missingSkills.slice(0, 6).map((s) => (
            <span key={s} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
