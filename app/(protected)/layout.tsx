import { redirect } from 'next/navigation'
import { createClient } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import PageTransition from '@/components/PageTransition'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Try to get user, but don't fail if not authenticated
  // This allows marketplace to work without auth
  const supabase = await createClient()
  let user = null
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user = currentUser
  } catch {
    // User not authenticated - this is OK for marketplace pages
    user = null
  }

  // Note: Individual pages (dashboard, trades, etc.) should check auth if needed
  // Marketplace pages work without authentication at the API level
  // The proxy.ts middleware handles route protection for non-marketplace routes

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}

