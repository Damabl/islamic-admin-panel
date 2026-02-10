import type { Document, DocumentsResponse, IngestResult } from './types';

const API_BASE = '/api/v1';

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
  const data: DocumentsResponse = await res.json();
  return data.documents ?? [];
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Ошибка удаления: ${res.status}`);
  }
}

export interface UploadAccepted {
  status: string;
  message: string;
  title: string;
}

export async function uploadDocument(
  file: File,
  title: string,
  sourceType: string,
  language: string,
): Promise<UploadAccepted> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('source_type', sourceType);
  formData.append('language', language);
  // No user_id — this is a verified/system document

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Ошибка загрузки: ${res.status}`);
  }

  return res.json();
}

export async function ingestDocument(body: {
  title: string;
  source_type: string;
  language: string;
  content: string;
  metadata?: Record<string, string>;
}): Promise<IngestResult> {
  const res = await fetch(`${API_BASE}/documents/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Ошибка: ${res.status}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch('/health');
  if (!res.ok) throw new Error('Сервер недоступен');
  return res.json();
}

export async function checkReady(): Promise<{ status: string }> {
  const res = await fetch('/ready');
  return res.json();
}
