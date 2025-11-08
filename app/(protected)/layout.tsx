import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import PageTransition from '@/components/PageTransition'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-hidden bg-[var(--background)] p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}

