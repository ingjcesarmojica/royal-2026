'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import {
  LayoutDashboard,
  Users,
  Kanban,
  MessageSquare,
  Upload,
  Settings,
  Package,
  FileText,
  Sun,
  Moon,
  LogOut,
  Crown,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react';

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'vendedor', 'manager', 'soporte', 'lectura'] },
  { href: '/customers', label: 'Clientes', icon: Users, roles: ['admin', 'vendedor', 'manager'] },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban, roles: ['admin', 'vendedor', 'manager'] },
  { href: '/products', label: 'Productos', icon: Package, roles: ['admin'] },
  { href: '/quotes', label: 'Cotizaciones', icon: FileText, roles: ['admin', 'vendedor'] },
  { href: '/messages', label: 'Mensajes', icon: MessageSquare, roles: ['admin', 'vendedor'] },
  { href: '/users', label: 'Usuarios', icon: UserCog, roles: ['admin'] },
  { href: '/import', label: 'Importar CSV', icon: Upload, roles: ['admin'] },
  { href: '/config', label: 'Configuración', icon: Settings, roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const menuItems = allMenuItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    vendedor: 'Vendedor',
    soporte: 'Soporte',
    lectura: 'Solo lectura',
  };

  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-64'} min-h-screen transition-all duration-300 flex flex-col`}
      style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Royal CRM</h1>
              <p className="text-xs text-white/60">2026</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto">
            <Crown className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-2 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-purple-700 shadow-lg shadow-purple-500/20'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-600' : ''}`} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 mb-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          title={collapsed ? (theme === 'dark' ? 'Modo claro' : 'Modo oscuro') : undefined}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="text-sm font-medium">
              {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </span>
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-3 border-t border-white/10">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Usuario'}</p>
              <p className="text-xs text-white/50">{roleLabels[user?.role] || user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
