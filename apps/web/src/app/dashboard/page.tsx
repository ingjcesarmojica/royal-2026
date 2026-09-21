'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import DateRangeFilter from '@/components/dashboard/date-range-filter';
import AlertsSection from '@/components/dashboard/alerts-section';
import ReassignModal from '@/components/dashboard/reassign-modal';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Mail,
  BarChart3,
  Activity,
  UserCheck,
  DollarSign,
  CreditCard,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

type DateRange = 'all' | 'today' | '7d' | '30d' | 'previous_month';

interface DashboardStats {
  totalCustomers: number;
  customersByStatus: { status: string; color: string; count: string; statusId: string }[];
  customersByOwner: { vendedor: string; userId: string; count: string }[];
  messagesByChannel: { channel: string; count: string }[];
  conversionRate: number;
  pipelineValue: number;
  averageTicket: number;
  averageCloseTimeDays: number;
  alerts: {
    sinSeguimiento: number;
    cotizacionesPorVencer: number;
    leadsSinContactar: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('all');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<{ id: string; name: string; count: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadStats(range);
  }, [range]);

  const loadStats = async (currentRange: DateRange) => {
    setLoading(true);
    try {
      const params = currentRange !== 'all' ? { range: currentRange } : {};
      const response = await api.get('/dashboard/stats', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
      value: stats?.messagesByChannel?.find((m) => m.channel === 'whatsapp')?.count || '0',
      icon: MessageSquare,
      color: 'bg-green-500',
      lightColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Email',
      value: stats?.messagesByChannel?.find((m) => m.channel === 'email')?.count || '0',
      icon: Mail,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Valor del Pipeline',
      value: formatCurrency(stats?.pipelineValue || 0),
      icon: DollarSign,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Ticket Promedio',
      value: formatCurrency(stats?.averageTicket || 0),
      icon: CreditCard,
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      textColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'Tiempo Prom. Cierre',
      value: stats?.averageCloseTimeDays ? `${stats.averageCloseTimeDays}d` : 'N/A',
      icon: Clock,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-100 dark:bg-rose-900/30',
      textColor: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const handleReassign = (vendor: { userId: string; vendedor: string; count: string }) => {
    setSelectedVendor({
      id: vendor.userId,
      name: vendor.vendedor || 'Sin asignar',
      count: Number(vendor.count),
    });
    setReassignOpen(true);
  };

  if (loading && !stats) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="h-6 w-40 bg-muted rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="h-6 w-44 bg-muted rounded animate-pulse mb-6" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Resumen de tu actividad de ventas</p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangeFilter value={range} onChange={setRange} />
            <button
              onClick={() => loadStats(range)}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`w-5 h-5 text-card-foreground ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                <button
                  key={index}
                  onClick={() => router.push(`/customers?statusId=${item.statusId}`)}
                  className="w-full text-left group/status hover:bg-muted/30 rounded-lg p-1 -m-1 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-card-foreground group-hover/status:text-primary transition-colors">
                        {item.status}
                      </span>
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
                </button>
              ))}
              {(!stats?.customersByStatus || stats.customersByStatus.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin datos de pipeline</p>
                </div>
              )}
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
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group/row"
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
                  <button
                    onClick={() => handleReassign(item)}
                    className="opacity-0 group-hover/row:opacity-100 p-2 rounded-lg hover:bg-muted transition-all"
                    title="Reasignar clientes"
                  >
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                  </button>
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

        {/* Alerts Section */}
        {stats?.alerts && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Próxima Mejor Acción</h3>
            </div>
            <AlertsSection alerts={stats.alerts} />
          </div>
        )}
      </main>

      {/* Reassign Modal */}
      {selectedVendor && (
        <ReassignModal
          isOpen={reassignOpen}
          onClose={() => {
            setReassignOpen(false);
            setSelectedVendor(null);
          }}
          fromVendor={selectedVendor}
          onReassigned={() => loadStats(range)}
        />
      )}
    </div>
  );
}
