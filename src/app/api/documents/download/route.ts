import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl } from '@/services/documents';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storagePath = searchParams.get('path');

    if (!storagePath) {
      return new NextResponse('Missing path parameter', { status: 400 });
    }

    // Generate a signed URL and redirect to it
    const signedUrl = await getDownloadUrl(storagePath);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error downloading document', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
