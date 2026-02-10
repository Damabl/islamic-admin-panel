import { useEffect, useState } from 'react';
import { Search, Trash2, FileText, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDocuments, deleteDocument } from '../api';
import type { Document } from '../types';
import { SOURCE_TYPE_LABELS, SOURCE_TYPE_COLORS, SOURCE_TYPES } from '../types';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<'verified' | 'user' | 'all'>('verified');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Удалить документ "${doc.title}"?\nЭто действие необратимо.`)) return;

    try {
      setDeletingId(doc.id);
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: any) {
      alert(`Ошибка: ${err?.message || 'Не удалось удалить'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = documents
    .filter((d) => {
      if (filterScope === 'verified') return !d.user_id;
      if (filterScope === 'user') return !!d.user_id;
      return true;
    })
    .filter((d) => filterType === 'all' || d.source_type === filterType)
    .filter(
      (d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Документы</h1>
          <p className="text-slate-500 mt-1">Управление достоверными источниками</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDocuments}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Загрузить
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="p-4 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию или ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Scope Filter */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(['verified', 'user', 'all'] as const).map((scope) => (
              <button
                key={scope}
                onClick={() => setFilterScope(scope)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterScope === scope
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {scope === 'verified'
                  ? 'Достоверные'
                  : scope === 'user'
                  ? 'Пользовательские'
                  : 'Все'}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">Все типы</option>
              {SOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadDocuments}
            className="ml-auto text-sm font-medium text-red-600 hover:text-red-700"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Загрузка документов...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Документы не найдены</p>
            <p className="text-sm text-slate-400 mt-1">
              {documents.length === 0
                ? 'Загрузите первый документ'
                : 'Попробуйте изменить фильтры'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Язык
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Источник
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          {doc.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          SOURCE_TYPE_COLORS[doc.source_type] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {SOURCE_TYPE_LABELS[doc.source_type] || doc.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {doc.language === 'ar'
                          ? '🇸🇦 Арабский'
                          : doc.language === 'ru'
                          ? '🇷🇺 Русский'
                          : doc.language === 'kk'
                          ? '🇰🇿 Казахский'
                          : doc.language}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.user_id ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          👤 Пользователь
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          ✓ Достоверный
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={deletingId === doc.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === doc.id ? 'Удаление...' : 'Удалить'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Показано {filtered.length} из {documents.length} документов
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
