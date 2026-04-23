import { motion } from 'framer-motion';

function colorFor(score: number) {
  if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-600', label: 'Excellent', tint: 'from-emerald-100 to-emerald-50' };
  if (score >= 60) return { stroke: '#f59e0b', text: 'text-amber-600',   label: 'Good',      tint: 'from-amber-100 to-amber-50' };
  return             { stroke: '#ef4444', text: 'text-red-600',     label: 'Needs work', tint: 'from-red-100 to-red-50' };
}

export function ATSScore({ score }: { score: number }) {
  const { text, stroke, label, tint } = colorFor(score);
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className={`relative w-44 h-44 rounded-full bg-gradient-to-br ${tint} p-2`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} stroke="#ffffff" strokeWidth="14" fill="transparent" />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={stroke}
            strokeWidth="14"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-5xl font-bold ${text} leading-none`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {clamped}
          </motion.span>
          <span className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">out of 100</span>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">ATS Score</div>
        <div className={`text-2xl font-bold ${text} mt-1`}>{label}</div>
        <p className="text-sm text-gray-600 mt-2 max-w-sm">
          {clamped >= 80
            ? 'Your resume is well-optimized for applicant tracking systems and keyword-scanning parsers.'
            : clamped >= 60
            ? 'Decent ATS compatibility. Address the improvements below to boost your callback rate.'
            : 'Significant ATS issues detected. Review the suggestions carefully before applying to roles.'}
        </p>
      </div>
    </div>
  );
}
