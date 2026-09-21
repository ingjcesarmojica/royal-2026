'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, Users, ExternalLink } from 'lucide-react';

interface DashboardAlerts {
  sinSeguimiento: number;
  cotizacionesPorVencer: number;
  leadsSinContactar: number;
}

interface AlertsSectionProps {
  alerts: DashboardAlerts;
}

export default function AlertsSection({ alerts }: AlertsSectionProps) {
  const router = useRouter();

  const alertItems = [
    {
      key: 'sinSeguimiento',
      count: alerts.sinSeguimiento,
      label: 'Clientes sin seguimiento',
      sublabel: 'más de 7 días sin actividad',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-800',
      link: '/customers',
    },
    {
      key: 'cotizacionesPorVencer',
      count: alerts.cotizacionesPorVencer,
      label: 'Cotizaciones por vencer',
      sublabel: 'vencen esta semana',
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      border: 'border-rose-200 dark:border-rose-800',
      link: '/quotes',
    },
    {
      key: 'leadsSinContactar',
      count: alerts.leadsSinContactar,
      label: 'Leads sin contactar',
      sublabel: 'esperando más de 24h',
      icon: Users,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      border: 'border-orange-200 dark:border-orange-800',
      link: '/customers',
    },
  ];

  const hasAlerts = alertItems.some((a) => a.count > 0);

  return (
    <div className="space-y-3">
      {alertItems.map((alert) => {
        const Icon = alert.icon;
        return (
          <button
            key={alert.key}
            onClick={() => router.push(alert.link)}
            disabled={alert.count === 0}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
              alert.count > 0
                ? `${alert.bg} ${alert.border} hover:shadow-md cursor-pointer`
                : 'bg-muted/30 border-border opacity-50 cursor-default'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`${alert.count > 0 ? alert.bg : 'bg-muted'} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${alert.count > 0 ? alert.color : 'text-muted-foreground'}`} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${alert.count > 0 ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                  {alert.label}
                </p>
                <p className="text-xs text-muted-foreground">{alert.sublabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${alert.count > 0 ? alert.color : 'text-muted-foreground'}`}>
                {alert.count}
              </span>
              {alert.count > 0 && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
            </div>
          </button>
        );
      })}

      {!hasAlerts && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">Todo al día — sin alertas pendientes</p>
        </div>
      )}
    </div>
  );
}
