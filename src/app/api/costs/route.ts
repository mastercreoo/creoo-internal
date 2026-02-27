import { NextResponse } from 'next/server';
import { addCosts } from '@/services/costs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cost = await addCosts(body);
    return NextResponse.json(cost, { status: 201 });
  } catch (error) {
    console.error('Error adding cost', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
