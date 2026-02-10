export interface Document {
  id: string;
  title: string;
  source_type: string;
  language: string;
  metadata: Record<string, string> | null;
  user_id?: string;
  created_at: string;
}

export interface DocumentsResponse {
  documents: Document[] | null;
  count: number;
}

export interface IngestResult {
  document_id: string;
  title: string;
  chunk_count: number;
}

export type SourceType = 'quran' | 'hadith' | 'tafsir' | 'fiqh' | 'aqeedah' | 'seerah' | 'book';

export const SOURCE_TYPES: { value: SourceType; label: string; icon: string }[] = [
  { value: 'quran', label: 'Коран', icon: '📖' },
  { value: 'hadith', label: 'Хадис', icon: '📜' },
  { value: 'tafsir', label: 'Тафсир', icon: '💬' },
  { value: 'fiqh', label: 'Фикх', icon: '⚖️' },
  { value: 'aqeedah', label: 'Акыда', icon: '🛡️' },
  { value: 'seerah', label: 'Сира', icon: '🕌' },
  { value: 'book', label: 'Книга', icon: '📚' },
];

export const LANGUAGES: { value: string; label: string }[] = [
  { value: 'ar', label: 'Арабский' },
  { value: 'ru', label: 'Русский' },
  { value: 'kk', label: 'Казахский' },
];

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  quran: 'Коран',
  hadith: 'Хадис',
  tafsir: 'Тафсир',
  fiqh: 'Фикх',
  aqeedah: 'Акыда',
  seerah: 'Сира',
  book: 'Книга',
};

export const SOURCE_TYPE_COLORS: Record<string, string> = {
  quran: 'bg-emerald-100 text-emerald-700',
  hadith: 'bg-amber-100 text-amber-700',
  tafsir: 'bg-purple-100 text-purple-700',
  fiqh: 'bg-blue-100 text-blue-700',
  aqeedah: 'bg-orange-100 text-orange-700',
  seerah: 'bg-teal-100 text-teal-700',
  book: 'bg-rose-100 text-rose-700',
};
