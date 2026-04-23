import Link from 'next/link';
import { FileText, Zap, Target, Download } from 'lucide-react';
import { useAuth } from '@/store/auth';

export default function Home() {
  const { user } = useAuth();
  const ctaHref = user ? '/upload' : '/register';
  const ctaLabel = user ? 'Upload a resume' : 'Get started — free';

  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Score your resume against real jobs
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your resume, get an instant ATS score, personalized improvements, and matches to
          jobs that actually fit your skills.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={ctaHref}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium no-underline hover:opacity-90 hover:no-underline"
          >
            {ctaLabel}
          </Link>
          {!user && (
            <Link
              href="/login"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 no-underline hover:bg-gray-50 hover:no-underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-6 mt-8">
        {[
          { icon: FileText, title: 'PDF upload', desc: 'Drop in your resume and we extract the text.' },
          { icon: Zap, title: 'AI analysis', desc: 'Gemini extracts skills, scores ATS, and suggests fixes.' },
          { icon: Target, title: 'Job matches', desc: 'See jobs ranked by how well your skills line up.' },
          { icon: Download, title: 'PDF report', desc: 'Download a polished report to share or save.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-lg border border-gray-200 p-5">
            <Icon className="text-primary" size={24} />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
