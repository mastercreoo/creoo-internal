'use server';

import { db } from '@/lib/insforge';

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  industry: string | null;
  contract_start: string | null;
  renewal_date: string | null;
  notes: string | null;
  created_at: string;
};

type CreateClientInput = Omit<Client, 'id' | 'created_at'>;
type UpdateClientInput = Partial<CreateClientInput>;

export async function getClients(): Promise<Client[]> {
  const { data, error } = await db
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Client[];
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as Client) ?? null;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const payload = {
    ...input,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from('clients')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export async function updateClient(
  id: string,
  updates: UpdateClientInput,
): Promise<Client> {
  const { data, error } = await db
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await db.from('clients').delete().eq('id', id);
  if (error) throw error;
}

export async function addClientDocumentReference(params: {
  clientId: string;
  path: string;
}): Promise<void> {
  const { error } = await db.from('client_documents').insert({
    client_id: params.clientId,
    path: params.path,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

