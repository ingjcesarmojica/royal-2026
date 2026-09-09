'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Mail,
  BarChart3,
  Activity,
  UserCheck,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalCustomers: number;
  customersByStatus: { status: string; color: string; count: string }[];
  customersByOwner: { vendedor: string; count: string }[];
  messagesByChannel: { channel: string; count: string }[];
  conversionRate: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Clientes',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Conversión',
      value: `${stats?.conversionRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'WhatsApp',
      value: stats?.messagesByChannel?.find((m) => m.channel === 'whatsapp')?.count || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
      lightColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Email',
      value: stats?.messagesByChannel?.find((m) => m.channel === 'email')?.count || 0,
      icon: Mail,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen de tu actividad de ventas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.lightColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Status */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Pipeline de Ventas</h3>
            </div>
            <div className="space-y-4">
              {stats?.customersByStatus?.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-card-foreground">{item.status}</span>
                    </div>
                    <span className="text-sm font-bold text-card-foreground">{item.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.color,
                        width: `${stats?.totalCustomers ? (Number(item.count) / stats.totalCustomers) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Activity */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Actividad del Equipo</h3>
            </div>
            <div className="space-y-3">
              {stats?.customersByOwner?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {item.vendedor
                        ? item.vendedor.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        : 'NA'}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{item.vendedor || 'Sin asignar'}</p>
                      <p className="text-xs text-muted-foreground">{item.count} clientes</p>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
              {(!stats?.customersByOwner || stats.customersByOwner.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin actividad registrada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
