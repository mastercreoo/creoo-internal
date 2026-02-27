import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/services/dashboard';
import { getPaymentStats } from '@/services/payments';

export async function GET() {
  try {
    const [metrics, paymentStats] = await Promise.all([
      getDashboardMetrics(),
      getPaymentStats(),
    ]);

    return NextResponse.json({
      ...metrics,
      ...paymentStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

