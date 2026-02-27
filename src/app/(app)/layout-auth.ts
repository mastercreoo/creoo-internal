import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server-side session validation for protected routes
 * Use this in any protected layout or page
 */
export async function validateSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;

  // NO SESSION = NOT ALLOWED
  if (!sessionCookie) {
    console.log('[PROTECTED] No session - redirecting to /login');
    redirect('/login');
  }

  // TRY TO PARSE
  let session;
  try {
    session = JSON.parse(sessionCookie);
  } catch (error) {
    console.error('[PROTECTED] Corrupt session - redirecting to /login');
    redirect('/login');
  }

  // MUST HAVE BOTH FIELDS
  if (!session.userId || !session.role) {
    console.error('[PROTECTED] Invalid session - redirecting to /login');
    redirect('/login');
  }

  return session;
}
