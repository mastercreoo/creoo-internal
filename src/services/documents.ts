'use server';

import { db } from '@/lib/insforge';

export type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  client_id: string | null;
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
