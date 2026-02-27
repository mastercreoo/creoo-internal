import { NextResponse } from 'next/server';
import { getClientsWithFinancials, createClient } from '@/services/clients';

export async function GET() {
  try {
    const clients = await getClientsWithFinancials();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await createClient(body);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
