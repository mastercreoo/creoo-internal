import { NextResponse } from 'next/server';
import { getTemplateById, updateTemplate, deleteTemplate } from '@/services/templates';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const template = await getTemplateById(id);
    if (!template) return new NextResponse('Not Found', { status: 404 });
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const template = await updateTemplate(id, body);
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteTemplate(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting template', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
