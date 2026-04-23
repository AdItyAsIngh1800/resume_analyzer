import Link from 'next/link';
import { FileText, Zap, Target, Download, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { LinkButton } from '@/components/ui/Button';

const features = [
  { icon: FileText, title: 'PDF upload',   desc: 'Drop your resume — we extract the text, no manual copy-paste.' },
  { icon: Zap,      title: 'AI analysis',  desc: 'A local model scores ATS compatibility and suggests fixes.' },
  { icon: Target,   title: 'Job matches',  desc: 'See jobs ranked by how well your skills line up with the role.' },
  { icon: Download, title: 'PDF report',   desc: 'Download a polished report to share with reviewers or save.' },
];

export default function Home() {
  const { user } = useAuth();
  const ctaHref = user ? '/upload' : '/register';
  const ctaLabel = user ? 'Upload a resume' : 'Get started — free';

  return (
    <div>
      <section className="text-center py-14 sm:py-20">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 ring-1 ring-brand-100 rounded-full px-3 py-1 mb-6">
          <Sparkles size={12} /> Powered by a local Ollama model — your resume never leaves your machine
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink">
          Score your resume against{' '}
          <span className="bg-gradient-brand bg-clip-text text-transparent">real jobs</span>
        </h1>
        <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your resume and get an instant ATS score, personalized improvements,
          and jobs ranked by how well your skills actually fit.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <LinkButton href={ctaHref} size="lg">
            {ctaLabel} <ArrowRight size={18} />
          </LinkButton>
          {!user && (
            <LinkButton href="/login" variant="secondary" size="lg">
              Sign in
            </LinkButton>
          )}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-brand-200 p-5 transition"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-brand text-white shadow-pop">
              <Icon size={18} />
            </div>
            <h3 className="mt-4 font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 grid md:grid-cols-3 gap-4">
        {[
          { n: '1', title: 'Upload',  body: 'Drag in any text-based PDF, up to 5 MB.' },
          { n: '2', title: 'Analyze', body: 'The model extracts skills, scores ATS, and writes improvements.' },
          { n: '3', title: 'Apply',   body: 'Download the PDF report, or explore matching jobs.' },
        ].map((step) => (
          <div key={step.n} className="relative bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-brand text-white font-bold flex items-center justify-center shadow-pop">
              {step.n}
            </div>
            <h3 className="font-semibold text-ink mt-2">{step.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
