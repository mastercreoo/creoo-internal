'use server';

import { db } from '@/lib/insforge';

export type TemplateType = 'proposal' | 'invoice' | 'contract' | 'sow';

export type Template = {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  created_at: string;
};

type CreateTemplateInput = Omit<Template, 'id' | 'created_at'>;
type UpdateTemplateInput = Partial<Omit<Template, 'id' | 'created_at'>>;

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await db.from('templates').select('*').order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Template[];
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const { data, error } = await db.from('templates').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return (data || null) as Template | null;
}

export async function createTemplate(input: CreateTemplateInput): Promise<Template> {
  const { data, error } = await db
    .from('templates')
    .insert({
      ...input,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Template;
}

export async function updateTemplate(id: string, updates: UpdateTemplateInput): Promise<Template> {
  const { data, error } = await db.from('templates').update(updates).eq('id', id).select().single();

  if (error) throw error;
  return data as Template;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await db.from('templates').delete().eq('id', id);

  if (error) throw error;
}
