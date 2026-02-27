'use server';

import { db } from '@/lib/insforge';

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'lead';
export type ServiceType = 'website' | 'ai_workflow' | 'automation' | 'management';

export type Project = {
  id: string;
  client_id: string;
  title: string;
  service_type: ServiceType;
  price: number;
  status: ProjectStatus;
  start_date: string | null;
  deadline: string | null;
  final_payment_date: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  project_id: string;
  type: 'advance' | 'final';
  amount: number;
  status: 'paid' | 'pending';
  paid_date: string | null;
};

export type Cost = {
  id: string;
  project_id: string;
  labor_cost: number;
  tool_cost: number;
  hosting_cost: number;
  other_cost: number;
};

export type ProjectWithRelations = Project & {
  payments: Payment[];
  costs: Cost[];
  client_name?: string;
};

export type ProjectWithClient = Project & {
  client_name: string;
  company_name: string;
  payments?: Payment[];
};

type CreateProjectInput = Omit<Project, 'id' | 'created_at' | 'final_payment_date'>;
type UpdateProjectInput = Partial<CreateProjectInput>;

export async function getProjects(): Promise<ProjectWithClient[]> {
  const [projectsRes, clientsRes, paymentsRes] = await Promise.all([
    db.from('projects').select('*').order('created_at', { ascending: false }),
    db.from('clients').select('id, client_name, company_name'),
    db.from('payments').select('*'),
  ]);

  if (projectsRes.error) throw projectsRes.error;
  if (clientsRes.error) throw clientsRes.error;
  if (paymentsRes.error) throw paymentsRes.error;

  const projects = (projectsRes.data || []) as Project[];
  const clients = (clientsRes.data || []) as any[];
  const payments = (paymentsRes.data || []) as Payment[];

  return projects.map((p) => {
    const client = clients.find((c: any) => c.id === p.client_id);
    const projectPayments = payments.filter((pay) => pay.project_id === p.id);
    return {
      ...p,
      client_name: client?.client_name ?? 'Unknown',
      company_name: client?.company_name ?? '',
      payments: projectPayments,
    };
  });
}

export async function getProjectWithRelations(id: string): Promise<ProjectWithRelations | null> {
  const [projectRes, paymentsRes, costsRes, clientsRes] = await Promise.all([
    db.from('projects').select('*').eq('id', id).maybeSingle(),
    db.from('payments').select('*').eq('project_id', id),
    db.from('costs').select('*').eq('project_id', id),
    db.from('clients').select('id, client_name, company_name'),
  ]);

  if (projectRes.error) throw projectRes.error;
  if (!projectRes.data) return null;

  const project = projectRes.data as Project;
  const clients = (clientsRes.data || []) as any[];
  const client = clients.find((c: any) => c.id === project.client_id);

  return {
    ...project,
    client_name: client?.client_name,
    payments: (paymentsRes.data || []) as Payment[],
    costs: (costsRes.data || []) as Cost[],
  };
}

export async function createProjectWithPayments(
  input: CreateProjectInput,
): Promise<{ project: Project; payments: Payment[] }> {
  const { data: project, error: projectError } = await db
    .from('projects')
    .insert({
      ...input,
      created_at: new Date().toISOString(),
      final_payment_date: null,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  const advanceAmount = (input.price || 0) * 0.4;
  const finalAmount = (input.price || 0) * 0.6;

  const { data: payments, error: paymentsError } = await db
    .from('payments')
    .insert([
      {
        project_id: project.id,
        type: 'advance',
        amount: advanceAmount,
        status: 'pending',
        paid_date: null,
      },
      {
        project_id: project.id,
        type: 'final',
        amount: finalAmount,
        status: 'pending',
        paid_date: null,
      },
    ])
    .select();

  if (paymentsError) throw paymentsError;

  return {
    project: project as Project,
    payments: (payments || []) as Payment[],
  };
}

export async function updateProject(id: string, updates: UpdateProjectInput): Promise<Project> {
  const { data, error } = await db
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await db.from('projects').delete().eq('id', id);
  if (error) throw error;
}
