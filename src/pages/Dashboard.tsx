import { useEffect, useState } from 'react';
import { FileText, Users, Database, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { fetchDocuments, checkReady } from '../api';
import type { Document } from '../types';
import { SOURCE_TYPE_LABELS, SOURCE_TYPE_COLORS } from '../types';

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'ready' | 'unavailable' | 'loading'>('loading');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, health] = await Promise.all([
        fetchDocuments().catch(() => []),
        checkReady().catch(() => ({ status: 'unavailable' })),
      ]);
      setDocuments(docs);
      setServerStatus(health.status === 'ready' ? 'ready' : 'unavailable');
    } finally {
      setLoading(false);
    }
  };

  const verifiedDocs = documents.filter((d) => !d.user_id);
  const userDocs = documents.filter((d) => !!d.user_id);

  // Count by source type
  const typeCounts: Record<string, number> = {};
  verifiedDocs.forEach((d) => {
    typeCounts[d.source_type] = (typeCounts[d.source_type] || 0) + 1;
  });

  const recentDocs = verifiedDocs.slice(0, 5);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Панель управления</h1>
        <p className="text-slate-500 mt-1">Обзор достоверных исламских источников</p>
      </div>

      {/* Server Status */}
      <div className="mb-6">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            serverStatus === 'ready'
              ? 'bg-emerald-50 text-emerald-700'
              : serverStatus === 'unavailable'
              ? 'bg-red-50 text-red-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              serverStatus === 'ready'
                ? 'bg-emerald-500'
                : serverStatus === 'unavailable'
                ? 'bg-red-500'
                : 'bg-slate-400'
            }`}
          />
          {serverStatus === 'ready'
            ? 'Сервер работает'
            : serverStatus === 'unavailable'
            ? 'Сервер недоступен'
            : 'Проверка...'}
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Достоверные документы"
            value={verifiedDocs.length}
            subtitle="Проверенные источники"
            icon={FileText}
            color="emerald"
          />
          <StatCard
            title="Пользовательские"
            value={userDocs.length}
            subtitle="Загружены пользователями"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Типы источников"
            value={Object.keys(typeCounts).length}
            subtitle="Категорий"
            icon={Database}
            color="amber"
          />
          <StatCard
            title="Всего документов"
            value={documents.length}
            subtitle="В системе"
            icon={Activity}
            color="purple"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Type Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">По типам источников</h2>
          </div>
          <div className="p-6">
            {Object.keys(typeCounts).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Нет данных</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(typeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            SOURCE_TYPE_COLORS[type] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {SOURCE_TYPE_LABELS[type] || type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(typeCounts))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Последние документы</h2>
            <Link
              to="/documents"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              Все <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentDocs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Нет документов</p>
            ) : (
              recentDocs.map((doc) => (
                <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(doc.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ml-3 ${
                      SOURCE_TYPE_COLORS[doc.source_type] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {SOURCE_TYPE_LABELS[doc.source_type] || doc.source_type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
