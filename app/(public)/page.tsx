'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import ModernHero from '@/components/landing/ModernHero'
import StatsTicker from '@/components/landing/StatsTicker'
import BentoFeatures from '@/components/landing/BentoFeatures'
import LiveAnalysisDemo from '@/components/landing/LiveAnalysisDemo'
import Pricing from '@/components/landing/Pricing'
import CallToAction from '@/components/landing/CallToAction'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030014] overflow-hidden selection:bg-amber-500/30 text-white">
      {/* Fondo Ambiental Global */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[50%] h-[30%] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col gap-0">
        <ModernHero />
        <StatsTicker />
        <BentoFeatures />
        <LiveAnalysisDemo />
        <Pricing />
        <CallToAction />
      </main>

      <Footer />
    </div>
  )
}
