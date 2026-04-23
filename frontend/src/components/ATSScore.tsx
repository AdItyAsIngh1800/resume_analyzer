import { motion } from 'framer-motion';

function colorFor(score: number) {
  if (score >= 80) return { bg: 'bg-success', text: 'text-success', stroke: '#00b341', label: 'Excellent' };
  if (score >= 60) return { bg: 'bg-warning', text: 'text-warning', stroke: '#ff9500', label: 'Good' };
  return { bg: 'bg-error', text: 'text-error', stroke: '#ff3333', label: 'Needs work' };
}

export function ATSScore({ score }: { score: number }) {
  const { text, stroke, label } = colorFor(score);
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90" width="160" height="160">
          <circle cx="80" cy="80" r={radius} stroke="#e5e7eb" strokeWidth="12" fill="transparent" />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={stroke}
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${text}`}>{clamped}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-500 uppercase tracking-wide">ATS Score</div>
        <div className={`text-xl font-semibold ${text}`}>{label}</div>
        <p className="text-sm text-gray-600 mt-1 max-w-xs">
          {clamped >= 80
            ? 'Your resume is well-optimized for applicant tracking systems.'
            : clamped >= 60
            ? 'Decent ATS compatibility. Address the improvements below.'
            : 'Significant ATS issues detected. Review the suggestions carefully.'}
        </p>
      </div>
    </div>
  );
}
