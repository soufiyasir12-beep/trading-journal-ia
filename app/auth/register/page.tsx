'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Si el usuario necesita verificar su email, no habrá sesión aún
      // Esto es el comportamiento esperado cuando se requiere verificación
      if (data.user && !data.session) {
        // Usuario registrado pero necesita verificar email
        setError('')
        setLoading(false)
        // Mostrar mensaje de éxito
        setError('¡Registro exitoso! Por favor, verifica tu correo electrónico para activar tu cuenta. Revisa tu bandeja de entrada.')
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
        return
      }

      // Si hay sesión (cuando no se requiere verificación de email)
      if (data.session) {
        // Esperar un momento para que las cookies se establezcan
        await new Promise((resolve) => setTimeout(resolve, 100))
        
        // Forzar recarga completa para que el proxy detecte la sesión
        window.location.href = '/dashboard'
        return
      }

      // Si llegamos aquí y no hay ni sesión ni usuario, algo salió mal
      throw new Error('No se pudo completar el registro')
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-[#05080f]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 relative z-10">
        <div>
          <h2 className="text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Comienza con NeuroStrat
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className={`rounded-lg p-3 text-sm border ${
              error.includes('¡Registro exitoso!') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-400">¿Ya tienes cuenta? </span>
            <Link
              href="/auth/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

