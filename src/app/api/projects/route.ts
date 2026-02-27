import { NextResponse } from 'next/server';
import { getProjects, createProjectWithPayments } from '@/services/projects';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createProjectWithPayments(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating project', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
