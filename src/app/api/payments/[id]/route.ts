import { NextResponse } from 'next/server';
import { markPaymentAsPaid } from '@/services/payments';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payment = await markPaymentAsPaid(
      id,
      body.paid_date ? new Date(body.paid_date) : new Date(),
    );
    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
