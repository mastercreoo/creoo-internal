import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/services/dashboard';

export async function GET() {
  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching finance data', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
