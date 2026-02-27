import { NextResponse } from 'next/server';
import { getProjectWithRelations, updateProject, deleteProject } from '@/services/projects';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const project = await getProjectWithRelations(id);
    if (!project) return new NextResponse('Not Found', { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const project = await updateProject(id, body);
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteProject(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
