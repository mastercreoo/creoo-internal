import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  try {
    // Clear the session cookie
    const cookie = serialize('auth_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Logout error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
