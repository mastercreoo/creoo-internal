'use server';

import { db } from '@/lib/insforge';

export type ProjectStatus = 'active' | 'completed' | 'paused';
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
};

type CreateProjectInput = Omit<Project, 'id' | 'created_at' | 'final_payment_date'>;

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Project[];
}

export async function getProjectWithRelations(
  id: string,
): Promise<ProjectWithRelations | null> {
  const { data, error } = await db
    .from('projects')
    .select(
      `
      *,
      payments(*),
      costs(*)
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return data as ProjectWithRelations;
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

  const advanceAmount = input.price * 0.4;
  const finalAmount = input.price * 0.6;

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

