import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Spinner } from '@/components/Loading';
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Upload your resume</h1>
      <p className="text-gray-600 mb-6">PDF only, up to 5 MB.</p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${
          isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 bg-white hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto text-gray-400" size={40} />
        <p className="mt-3 font-medium">
          {isDragActive ? 'Drop it here' : 'Drag & drop your PDF here, or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Max 5 MB · PDF only</p>
      </div>

      {file && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex items-center gap-3">
          <FileText className="text-primary" size={20} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-sm text-gray-500 hover:text-error">
            Remove
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-error">{error}</div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || stage !== 'idle'}
        className="mt-6 w-full bg-primary text-white rounded py-3 font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {stage !== 'idle' && <Spinner size={16} />}
        {stage === 'uploading' && 'Uploading...'}
        {stage === 'analyzing' && 'Analyzing with AI — this takes ~10s...'}
        {stage === 'idle' && 'Analyze resume'}
      </button>
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
