import { NextResponse } from 'next/server';
import { deleteDocument } from '@/services/documents';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteDocument(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
