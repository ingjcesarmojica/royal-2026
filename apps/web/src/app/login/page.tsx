'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useTheme } from '@/components/theme-provider';
import { Crown, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Bienvenido a Royal CRM');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-royal-lg">
            <Crown className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Royal CRM</h1>
          <p className="text-white/80 text-xl text-center max-w-md">
            Gestión de relaciones con clientes para PyMEs
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-white/60 text-sm">Usuarios</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">2</p>
              <p className="text-white/60 text-sm">Canales</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-white/60 text-sm">Personalizable</p>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-royal">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Royal CRM</h1>
              <p className="text-sm text-muted-foreground">2026</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Bienvenido</h2>
            <p className="text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 gradient-primary text-white rounded-xl font-medium hover:shadow-royal-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-background text-muted-foreground text-xs uppercase tracking-wider">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="py-3 px-4 border border-border rounded-xl hover:bg-accent transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="py-3 px-4 border border-border rounded-xl hover:bg-accent transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
                    fill="#00ADEF"
                  />
                </svg>
                Microsoft
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Royal CRM 2026 v1.0 &mdash; Sistema de gestión de clientes
          </p>
        </div>
      </div>
    </div>
  );
}
