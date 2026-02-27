import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // VALIDATE SESSION BEFORE RENDERING ANYTHING
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session')?.value;

  // NO COOKIE = NO ACCESS
  if (!sessionCookie) {
    console.log('[APP LAYOUT] No session - redirecting to /login');
    return redirect('/login');
  }

  // PARSE SESSION
  let session;
  try {
    session = JSON.parse(sessionCookie);
  } catch (error) {
    console.error('[APP LAYOUT] Invalid session - redirecting to /login');
    return redirect('/login');
  }

  // VALIDATE REQUIRED FIELDS
  if (!session.userId || !session.role) {
    console.error('[APP LAYOUT] Missing session fields - redirecting to /login');
    return redirect('/login');
  }

  console.log(`[APP LAYOUT] Session valid: user=${session.userId}, role=${session.role}`);

  // ONLY RENDER IF SESSION IS VALID
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <header className="flex h-16 items-center border-b px-4 lg:px-6">
              <SidebarTrigger />
              <div className="ml-4 flex items-center gap-2 text-sm font-medium">
                <span className="text-muted-foreground">Creo AI Studio</span>
                <span className="text-muted-foreground">/</span>
                <span>Internal OS</span>
              </div>
            </header>
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
