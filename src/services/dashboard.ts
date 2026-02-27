'use server';

import { db } from '@/lib/insforge';
import { computeCostMetrics } from './costs';

export type ProjectMetric = {
  id: string;
  title: string;
  service_type: string;
  price: number;
  profit: number;
  margin: number;
  cycle_days: number | null;
  status: string;
};

export type RevenueByMonth = {
  month: string;
  revenue: number;
  expenses: number;
};

export async function getDashboardMetrics() {
  const [projectsRes, paymentsRes, costsRes] = await Promise.all([
    db.from('projects').select('*'),
    db.from('payments').select('*'),
    db.from('costs').select('*'),
  ]);

  if (projectsRes.error) throw projectsRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (costsRes.error) throw costsRes.error;

  const projects = (projectsRes.data || []) as any[];
  const payments = (paymentsRes.data || []) as any[];
  const costs = (costsRes.data || []) as any[];

  const totalRevenue = projects.reduce((sum, p) => sum + (p.price || 0), 0);

  let totalReceived = 0;
  let totalPending = 0;
  for (const p of payments) {
    if (p.status === 'paid') totalReceived += p.amount || 0;
    else totalPending += p.amount || 0;
  }

  let totalCosts = 0;
  let totalProfit = 0;

  const profitByServiceType: Record<string, { revenue: number; cost: number; profit: number }> = {};
  const projectMetrics: ProjectMetric[] = [];

  for (const project of projects) {
    const projectCosts = costs.filter((c) => c.project_id === project.id);
    const metrics = await computeCostMetrics(project.price || 0, projectCosts);

    totalCosts += metrics.total_cost;
    totalProfit += metrics.profit;

    const key = project.service_type || 'other';
    if (!profitByServiceType[key]) {
      profitByServiceType[key] = { revenue: 0, cost: 0, profit: 0 };
    }
    profitByServiceType[key].revenue += project.price || 0;
    profitByServiceType[key].cost += metrics.total_cost;
    profitByServiceType[key].profit += metrics.profit;

    let cycle_days: number | null = null;
    if (project.start_date && project.final_payment_date) {
      const start = new Date(project.start_date).getTime();
      const end = new Date(project.final_payment_date).getTime();
      cycle_days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    }

    projectMetrics.push({
      id: project.id,
      title: project.title,
      service_type: project.service_type || 'other',
      price: project.price || 0,
      profit: metrics.profit,
      margin: Math.round(metrics.margin * 10) / 10,
      cycle_days,
      status: project.status || 'active',
    });
  }

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;

  const projectsWithFinal = projects.filter((p) => p.start_date && p.final_payment_date);
  let avgCycleTimeDays = 0;
  if (projectsWithFinal.length > 0) {
    const totalDays = projectsWithFinal.reduce((sum, p) => {
      const start = new Date(p.start_date as string).getTime();
      const end = new Date(p.final_payment_date as string).getTime();
      return sum + (end - start) / (1000 * 60 * 60 * 24);
    }, 0);
    avgCycleTimeDays = Math.round(totalDays / projectsWithFinal.length);
  }

  // Group revenue and expenses by month
  const monthMap: Record<string, { revenue: number; expenses: number }> = {};
  for (const project of projects) {
    if (!project.start_date) continue;
    const d = new Date(project.start_date as string);
    if (isNaN(d.getTime())) continue; // Skip invalid dates
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = { revenue: 0, expenses: 0 };
    monthMap[key].revenue += project.price || 0;

    const projectCosts = costs.filter((c) => c.project_id === project.id);
    const costMetrics = await computeCostMetrics(project.price || 0, projectCosts);
    monthMap[key].expenses += costMetrics.total_cost;
  }

  const revenueByMonth: RevenueByMonth[] = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      if (isNaN(year) || isNaN(month)) {
        return { month: 'Invalid', revenue: val.revenue, expenses: val.expenses };
      }
      const d = new Date(year, month - 1);
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        revenue: val.revenue,
        expenses: val.expenses,
      };
    });

  const months = new Set<string>();
  for (const p of projects) {
    if (!p.start_date) continue;
    const d = new Date(p.start_date as string);
    months.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
  }
  const monthCount = Math.max(1, months.size);
  const burnRate = Math.round(totalCosts / monthCount);

  return {
    totalRevenue,
    totalReceived,
    totalPending,
    totalCosts,
    totalProfit,
    profitByServiceType,
    burnRate,
    activeProjectsCount,
    completedProjectsCount,
    avgCycleTimeDays,
    revenueByMonth,
    projectMetrics,
  };
}
