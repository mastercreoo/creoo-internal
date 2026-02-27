'use server';

import { db } from '@/lib/insforge';

export type ClientStatus = 'active' | 'completed' | 'paused';

export type Client = {
  id: string;
  client_name: string;
  company_name: string | null;
  contact_email: string | null;
  phone: string | null;
  industry: string | null;
  lead_source: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  renewal_date: string | null;
  payment_structure: string | null;
  status: ClientStatus;
  created_at: string;
};

export type ClientWithFinancials = Client & {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  margin_percent: number;
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

export async function getClientsWithFinancials(): Promise<ClientWithFinancials[]> {
  const [clientsRes, projectsRes, costsRes] = await Promise.all([
    db.from('clients').select('*').order('created_at', { ascending: false }),
    db.from('projects').select('id, client_id, price'),
    db.from('costs').select('project_id, labor_cost, tool_cost, hosting_cost, other_cost'),
  ]);

  if (clientsRes.error) throw clientsRes.error;
  if (projectsRes.error) throw projectsRes.error;
  if (costsRes.error) throw costsRes.error;

  const clients = (clientsRes.data || []) as Client[];
  const projects = (projectsRes.data || []) as any[];
  const costs = (costsRes.data || []) as any[];

  return clients.map((client) => {
    const clientProjects = projects.filter((p) => p.client_id === client.id);
    const total_revenue = clientProjects.reduce((sum: number, p: any) => sum + (p.price || 0), 0);

    let total_cost = 0;
    for (const p of clientProjects) {
      const projectCosts = costs.filter((c: any) => c.project_id === p.id);
      total_cost += projectCosts.reduce(
        (sum: number, c: any) => sum + (c.labor_cost || 0) + (c.tool_cost || 0) + (c.hosting_cost || 0) + (c.other_cost || 0),
        0,
      );
    }

    const total_profit = total_revenue - total_cost;
    const margin_percent = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;

    return { ...client, total_revenue, total_cost, total_profit, margin_percent };
  });
}

export async function getClientById(id: string): Promise<ClientWithFinancials | null> {
  const [clientRes, projectsRes, costsRes] = await Promise.all([
    db.from('clients').select('*').eq('id', id).maybeSingle(),
    db.from('projects').select('id, price').eq('client_id', id),
    db.from('costs').select('project_id, labor_cost, tool_cost, hosting_cost, other_cost'),
  ]);

  if (clientRes.error) throw clientRes.error;
  if (!clientRes.data) return null;

  const client = clientRes.data as Client;
  const projects = (projectsRes.data || []) as any[];
  const costs = (costsRes.data || []) as any[];

  const total_revenue = projects.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
  let total_cost = 0;
  for (const p of projects) {
    const projectCosts = costs.filter((c: any) => c.project_id === p.id);
    total_cost += projectCosts.reduce(
      (sum: number, c: any) => sum + (c.labor_cost || 0) + (c.tool_cost || 0) + (c.hosting_cost || 0) + (c.other_cost || 0),
      0,
    );
  }
  const total_profit = total_revenue - total_cost;
  const margin_percent = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;

  return { ...client, total_revenue, total_cost, total_profit, margin_percent };
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

export async function updateClient(id: string, updates: UpdateClientInput): Promise<Client> {
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
