'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User, LogOut, DollarSign, Settings, MessageSquare, TrendingUp } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
    id: string
    account_capital: string | null
    email?: string
    // Add other fields as needed
}

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [accountCapital, setAccountCapital] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            setProfile(profileData)
            if (profileData?.account_capital) {
                setAccountCapital(parseFloat(profileData.account_capital))
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateCapital = async () => {
        if (accountCapital === null || !user) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ account_capital: accountCapital })
                .eq('id', user.id)

            if (error) throw error
            // Optional: Show success message
        } catch (error) {
            console.error('Error updating capital:', error)
            alert('Error al actualizar el capital')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
                />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent">
                    Mi Perfil
                </h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Personal */}
                <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--card-border)] shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-500/10 rounded-full">
                            <User className="h-6 w-6 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Información Personal</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                Email
                            </label>
                            <div className="text-[var(--text-primary)] font-medium">
                                {user?.email}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                ID de Usuario
                            </label>
                            <div className="text-[var(--text-primary)] text-sm font-mono opacity-75">
                                {user?.id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Capital de Cuenta */}
                <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--card-border)] shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-green-500/10 rounded-full">
                            <DollarSign className="h-6 w-6 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Capital de Cuenta</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Capital Actual ($)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={accountCapital || ''}
                                    onChange={(e) => setAccountCapital(parseFloat(e.target.value) || null)}
                                    placeholder="0.00"
                                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                    onClick={handleUpdateCapital}
                                    disabled={saving}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">
                                Este valor se utiliza para calcular tus ganancias y pérdidas en dólares.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="md:col-span-2 bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--card-border)] shadow-lg">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Gestión</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/strategy')}
                            className="flex items-center gap-4 p-4 rounded-lg bg-[var(--background)] hover:bg-[var(--card-border)] transition-all border border-[var(--card-border)] group cursor-pointer"
                        >
                            <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                                <TrendingUp className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-[var(--text-primary)]">Estrategias</div>
                                <div className="text-sm text-[var(--text-secondary)]">Gestiona tus estrategias</div>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/community')}
                            className="flex items-center gap-4 p-4 rounded-lg bg-[var(--background)] hover:bg-[var(--card-border)] transition-all border border-[var(--card-border)] group cursor-pointer"
                        >
                            <div className="p-3 bg-purple-500/10 rounded-full group-hover:bg-purple-500/20 transition-colors">
                                <MessageSquare className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-[var(--text-primary)]">Comunidad</div>
                                <div className="text-sm text-[var(--text-secondary)]">Interactúa con otros traders</div>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/settings')}
                            className="flex items-center gap-4 p-4 rounded-lg bg-[var(--background)] hover:bg-[var(--card-border)] transition-all border border-[var(--card-border)] group cursor-pointer opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <div className="p-3 bg-gray-500/10 rounded-full">
                                <Settings className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-[var(--text-primary)]">Configuración</div>
                                <div className="text-sm text-[var(--text-secondary)]">Próximamente</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
