import { cookies } from 'next/headers';

/**
 * Session data stored in httpOnly cookie
 */
export interface SessionData {
  userId: string;
  role: 'admin' | 'user';
}

/**
 * Get current session from cookie
 * Returns null if no valid session
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session')?.value;

    if (!sessionCookie) {
      return null;
    }

    const session = JSON.parse(sessionCookie) as SessionData;

    // Validate session has required fields
    if (!session.userId || !session.role) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'admin';
}
