'use server';

import { db } from '@/lib/insforge';

export type Cost = {
  id: string;
  project_id: string;
  labor_cost: number;
  tool_cost: number;
  hosting_cost: number;
  other_cost: number;
};

type AddCostsInput = Omit<Cost, 'id'>;

export async function addCosts(input: AddCostsInput): Promise<Cost> {
  const { data, error } = await db
    .from('costs')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Cost;
}

export async function getCostsForProject(projectId: string): Promise<Cost[]> {
  const { data, error } = await db
    .from('costs')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return (data || []) as Cost[];
}

export async function computeCostMetrics(projectPrice: number, costs: Cost[]) {
  const totals = costs.reduce(
    (acc, cost) => {
      acc.labor += cost.labor_cost || 0;
      acc.tool += cost.tool_cost || 0;
      acc.hosting += cost.hosting_cost || 0;
      acc.other += cost.other_cost || 0;
      return acc;
    },
    { labor: 0, tool: 0, hosting: 0, other: 0 },
  );

  const total_cost = totals.labor + totals.tool + totals.hosting + totals.other;
  const profit = projectPrice - total_cost;
  const margin = projectPrice > 0 ? (profit / projectPrice) * 100 : 0;

  return { ...totals, total_cost, profit, margin };
}
