'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import {
  StickyNote,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Bell,
  Clock,
  ArrowRight,
  Trash2,
  Check,
} from 'lucide-react';

interface Interaction {
  id: string;
  customerId?: string;
  type: string;
  content?: string;
  scheduledAt?: string;
  reminderAt?: string;
  completed: boolean;
  createdAt: string;
  user: { id: string; fullName: string };
}

interface InteractionTimelineProps {
  interactions: Interaction[];
  onDeleted: () => void;
}

const typeConfig: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
  nota: { icon: StickyNote, label: 'Nota', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  llamada: { icon: Phone, label: 'Llamada', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  whatsapp: { icon: MessageSquare, label: 'WhatsApp', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  email: { icon: Mail, label: 'Email', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  visita: { icon: MapPin, label: 'Visita', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  alarma: { icon: Bell, label: 'Alarma', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  recordatorio: { icon: Clock, label: 'Recordatorio', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  cambio_estado: { icon: ArrowRight, label: 'Cambio de estado', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
};

export default function InteractionTimeline({ interactions, onDeleted }: InteractionTimelineProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/interactions/${id}`);
      onDeleted();
    } catch (error) {
      console.error('Error deleting interaction:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleComplete = async (interaction: Interaction) => {
    try {
      await api.post('/interactions', {
        customerId: interaction.customerId || '',
        userId: interaction.user.id,
        type: 'nota',
        content: `Marcar como completado: ${interaction.content || interaction.type}`,
      });
      await api.delete(`/interactions/${interaction.id}`);
      onDeleted();
    } catch (error) {
      console.error('Error completing interaction:', error);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (interactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-muted-foreground">Sin actividad registrada</p>
        <p className="text-sm text-muted-foreground mt-1">
          Usa el botón "Registrar Actividad" para agregar la primera interacción
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => {
        const config = typeConfig[interaction.type] || typeConfig.nota;
        const Icon = config.icon;
        const isPending = !interaction.completed && (interaction.type === 'alarma' || interaction.type === 'recordatorio');

        return (
          <div
            key={interaction.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
              isPending
                ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'
                : 'border-border hover:bg-muted/30'
            }`}
          >
            <div className={`${config.bgColor} p-2 rounded-lg flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                {interaction.scheduledAt && (
                  <span className="text-xs text-muted-foreground">
                    — {formatDateTime(interaction.scheduledAt)}
                  </span>
                )}
                {isPending && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                    Pendiente
                  </span>
                )}
              </div>
              {interaction.content && (
                <p className="text-sm text-card-foreground whitespace-pre-wrap">{interaction.content}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{interaction.user.fullName}</span>
                <span>•</span>
                <span>{formatDateTime(interaction.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isPending && (
                <button
                  onClick={() => handleComplete(interaction)}
                  className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
                  title="Marcar como completado"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(interaction.id)}
                disabled={deletingId === interaction.id}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Eliminar"
              >
                {deletingId === interaction.id ? (
                  <div className="w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
