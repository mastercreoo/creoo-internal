import { NextResponse } from 'next/server';
import { getTemplates, createTemplate } from '@/services/templates';

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = await createTemplate(body);
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
