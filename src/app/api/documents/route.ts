import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getDocumentsByProject, createDocument, uploadToStorage } from '@/services/documents';
import { db } from '@/lib/insforge';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('project_id');

    let documents;
    if (projectId) {
      documents = await getDocumentsByProject(projectId);
    } else {
      documents = await getDocuments();

      // Fetch client names for each document
      const clientsRes = await db.from('clients').select('id, client_name');
      const clients = (clientsRes.data || []) as any[];

      return NextResponse.json(
        documents.map((doc) => {
          const client = clients.find((c) => c.id === doc.client_id);
          return {
            ...doc,
            client_name: client?.client_name || 'Unassigned',
          };
        })
      );
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('project_id') as string | null;
    const clientId = formData.get('client_id') as string | null;
    const storagePath = formData.get('storage_path') as string;

    if (!file || !storagePath) {
      return new NextResponse('Missing file or storage_path', { status: 400 });
    }

    // Upload file to InsForge storage
    await uploadToStorage(file, storagePath);

    // Create document metadata in database
    const document = await createDocument({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      client_id: clientId || null,
      project_id: projectId || null,
      storage_path: storagePath,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
