import { NextResponse } from 'next/server';
import { getProjectWithRelations, updateProject, deleteProject, createFinalPayment } from '@/services/projects';
import { db } from '@/lib/insforge';

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

    // Auto-create final payment when project is marked as completed
    if (body.status === 'completed' && project) {
      // Check if final payment already exists
      const { data: existingFinal } = await db
        .from('payments')
        .select('id')
        .eq('project_id', id)
        .eq('type', 'final')
        .maybeSingle();

      if (!existingFinal) {
        // Get advance payment amount
        const { data: advancePayment } = await db
          .from('payments')
          .select('amount')
          .eq('project_id', id)
          .eq('type', 'advance')
          .maybeSingle();

        const advanceAmount = advancePayment?.amount || 0;
        await createFinalPayment(id, project.price || 0, advanceAmount);
      }
    }

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
