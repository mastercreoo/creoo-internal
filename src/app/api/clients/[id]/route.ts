import { NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/services/clients';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const client = await getClientById(id);
    if (!client) return new NextResponse('Not Found', { status: 404 });
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = await updateClient(id, body);
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteClient(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting client', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
