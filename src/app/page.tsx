import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Root page (/)
 * MUST validate session before doing ANYTHING
 * No defaults, no assumptions, strict validation only
 */
export default async function Home() {
  console.log('[ROOT PAGE] User visiting / - validating session...');

  // STEP 1: Get cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;

  // STEP 2: No cookie = NOT logged in
  if (!sessionCookie) {
    console.log('[ROOT PAGE] No session cookie found - redirecting to /login');
    return redirect('/login');
  }

  // STEP 3: Try to parse
  let session;
  try {
    session = JSON.parse(sessionCookie);
    console.log(`[ROOT PAGE] Parsed session: userId=${session.userId}, role=${session.role}`);
  } catch (error) {
    console.error('[ROOT PAGE] Failed to parse session cookie - redirecting to /login');
    return redirect('/login');
  }

  // STEP 4: Validate required fields
  if (!session.userId) {
    console.error('[ROOT PAGE] Missing userId in session - redirecting to /login');
    return redirect('/login');
  }

  if (!session.role) {
    console.error('[ROOT PAGE] Missing role in session - redirecting to /login');
    return redirect('/login');
  }

  // STEP 5: Valid session - go to dashboard
  console.log(`[ROOT PAGE] Valid session confirmed - redirecting to /dashboard`);
  return redirect('/dashboard');
}
