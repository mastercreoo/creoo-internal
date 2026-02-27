import { NextRequest, NextResponse } from 'next/server';
import { updateUser, deleteUser, findUserById } from '@/services/users';

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/users/[id]
 * Update a user (admin only)
 * Body: { name?, email?, role? }
 */
export async function PATCH(request: NextRequest, { params }: Params) {
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

    const { id } = await params;

    // Verify user exists
    const user = await findUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, role } = body as {
      name?: string;
      email?: string;
      role?: string;
    };

    // Validate role if provided
    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be admin or user' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(id, { name, email, role: role as 'admin' | 'user' });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user', error);

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

/**
 * DELETE /api/users/[id]
 * Delete a user (admin only)
 * Cannot delete own account
 */
export async function DELETE(request: NextRequest, { params }: Params) {
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

    const { id } = await params;

    // Prevent deleting own account
    if (session.userId === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await findUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await deleteUser(id);

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
