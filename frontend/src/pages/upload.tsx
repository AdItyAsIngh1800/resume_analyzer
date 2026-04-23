import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, AlertCircle, X, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { api, apiErrorMessage } from '@/utils/api';

function UploadInner() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setError(null);
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setError(null);
    setStage('uploading');
    try {
      const form = new FormData();
      form.append('resume', file);
      const { data: uploadRes } = await api.post('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStage('analyzing');
      await api.post(`/resumes/${uploadRes.resumeId}/analyze`);
      router.push(`/resumes/${uploadRes.resumeId}`);
    } catch (err) {
      setError(apiErrorMessage(err));
      setStage('idle');
    }
  };

  const rejection = fileRejections[0]?.errors[0]?.message;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-ink tracking-tight">Upload your resume</h1>
      <p className="text-gray-600 mt-2">PDF only, up to 5 MB. Analysis runs locally on your Ollama model.</p>

      <div
        {...getRootProps()}
        className={[
          'mt-6 border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition',
          isDragActive
            ? 'border-brand-500 bg-brand-50 scale-[1.01]'
            : 'border-gray-300 bg-white/70 hover:border-brand-400 hover:bg-brand-50/40',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-pop">
          <UploadCloud size={24} />
        </div>
        <p className="mt-4 font-semibold text-ink">
          {isDragActive ? 'Drop it here' : 'Drag & drop your PDF'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          or <span className="text-brand-600 font-medium underline underline-offset-2">click to browse</span>
          · Max 5 MB
        </p>
      </div>

      {rejection && !file && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 ring-1 ring-amber-100 rounded-xl p-3">
          <AlertCircle size={14} /> {rejection}
        </div>
      )}

      {file && (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-card flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · ready to analyze</p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 ring-1 ring-red-100 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={!file}
        loading={stage !== 'idle'}
        size="lg"
        className="mt-6 w-full"
      >
        {stage === 'uploading' && 'Uploading…'}
        {stage === 'analyzing' && 'Analyzing with AI — this may take 15–45s…'}
        {stage === 'idle' && (
          <>
            <Sparkles size={18} /> Analyze resume
          </>
        )}
      </Button>

      {stage === 'analyzing' && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          Tip: the local model is single-threaded — don't refresh the page.
        </p>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadInner />
    </ProtectedRoute>
  );
}
