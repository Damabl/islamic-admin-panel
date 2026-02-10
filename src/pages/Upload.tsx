import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../api';
import type { UploadAccepted } from '../api';
import { SOURCE_TYPES, LANGUAGES } from '../types';

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState('quran');
  const [language, setLanguage] = useState('ar');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadAccepted | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      // Auto-fill title from filename
      if (!title) {
        const name = selected.name.replace(/\.(pdf|json|txt)$/i, '');
        setTitle(name);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      const ext = dropped.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'json', 'txt'].includes(ext || '')) {
        setError('Поддерживаемые форматы: PDF, JSON, TXT');
        return;
      }
      setFile(dropped);
      setError(null);
      if (!title) {
        setTitle(dropped.name.replace(/\.(pdf|json|txt)$/i, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Выберите файл');
      return;
    }
    if (!title.trim()) {
      setError('Введите название');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await uploadDocument(file, title.trim(), sourceType, language);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSourceType('quran');
    setLanguage('ar');
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Success state
  if (result) {
    return (
      <div className="p-8">
        <div className="max-w-xl mx-auto mt-12">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Файл принят!</h2>
            <p className="text-slate-500 mb-6">Документ обрабатывается в фоновом режиме. Чанкирование и генерация эмбеддингов может занять несколько минут.</p>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Название:</span>
                <span className="font-medium text-slate-900">{result.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Статус:</span>
                <span className="font-medium text-amber-600">Обрабатывается...</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Загрузить ещё
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                К документам
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Загрузить документ</h1>
        <p className="text-slate-500 mt-1">
          Добавить новый достоверный исламский источник в систему
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Файл</label>
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-colors ${
              file
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-200 bg-white hover:border-emerald-400'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.json,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-10 text-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <UploadIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Нажмите для выбора или перетащите файл
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, JSON или TXT — до 50 МБ</p>
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Название *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Сахих аль-Бухари, глава 1"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Source Type & Language */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Тип источника</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Язык</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !file || !title.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Загрузка и обработка...
            </>
          ) : (
            <>
              <UploadIcon className="w-5 h-5" />
              Загрузить документ
            </>
          )}
        </button>

        {/* Note */}
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium mb-1">⚠️ Важно</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Документ будет добавлен как <strong>достоверный источник</strong> и станет доступен всем
            пользователям при поиске через AI. Убедитесь в подлинности и точности источника.
          </p>
        </div>
      </form>
    </div>
  );
}
