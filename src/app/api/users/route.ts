import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/services/users';

/**
 * GET /api/users
 * Returns all users (password hashes excluded)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate session exists (middleware checks this, but be explicit)
    const sessionCookie = request.cookies.get('auth_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie);

    // Check if user is admin
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 * Body: { name, email, password, role? }
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie);

    // Check if user is admin
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!['admin', 'user'].includes(role || 'user')) {
      return NextResponse.json(
        { error: 'Role must be admin or user' },
        { status: 400 }
      );
    }

    const user = await createUser({
      name,
      email,
      password,
      role: (role as 'admin' | 'user') || 'user',
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user', error);

    // Handle duplicate email
    if (error.message?.includes('unique')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
