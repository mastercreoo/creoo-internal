'use server';

import { db, insforge } from '@/lib/insforge';

export type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  client_id: string | null;
  project_id: string | null;
  storage_path: string;
  created_at: string;
};

export type CreateDocumentInput = Omit<Document, 'id' | 'created_at'>;

export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await db
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Document[];
}

export async function getDocumentsByClient(clientId: string): Promise<Document[]> {
  const { data, error } = await db
    .from('documents')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Document[];
}

export async function getDocumentsByProject(projectId: string): Promise<Document[]> {
  const { data, error } = await db
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Document[];
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const { data, error } = await db
    .from('documents')
    .insert({
      ...input,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await db.from('documents').delete().eq('id', id);

  if (error) throw error;
}

export async function uploadToStorage(file: File, path: string): Promise<string> {
  const bucket = insforge.storage.from('documents');
  const { data, error } = await bucket.upload(path, file);

  if (error) throw error;
  if (!data) throw new Error('No data returned from upload');
  // Return the path/key for storage reference
  return (data as any).key || (data as any).path || path;
}

export async function getDownloadUrl(path: string): Promise<string> {
  // For now, return the storage path for the frontend to handle
  // In production, implement proper signed URL generation based on InsForge API
  return `/api/documents/download?path=${encodeURIComponent(path)}`;
}
