'use client'

import { motion } from 'framer-motion'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import AIFeatures from '@/components/landing/AIFeatures'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AIFeatures />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

