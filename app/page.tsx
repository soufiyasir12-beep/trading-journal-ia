import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import LandingPageClient from './(public)/page'

export default async function HomePage() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  // Show landing page for non-authenticated users
  return <LandingPageClient />
}
