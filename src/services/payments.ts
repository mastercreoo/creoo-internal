'use server';

import { db } from '@/lib/insforge';

export type PaymentStatus = 'paid' | 'pending';

export type Payment = {
  id: string;
  project_id: string;
  type: 'advance' | 'final';
  amount: number;
  status: PaymentStatus;
  paid_date: string | null;
};

export async function markPaymentAsPaid(
  paymentId: string,
  paidDate: Date = new Date(),
): Promise<Payment> {
  const { data, error } = await db
    .from('payments')
    .update({
      status: 'paid',
      paid_date: paidDate.toISOString(),
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function getPaymentStats() {
  const { data, error } = await db.from('payments').select('amount, status');

  if (error) throw error;

  let totalReceived = 0;
  let totalPending = 0;

  for (const row of (data || []) as { amount: number; status: PaymentStatus }[]) {
    if (row.status === 'paid') totalReceived += row.amount || 0;
    else totalPending += row.amount || 0;
  }

  return { totalReceived, totalPending };
}

