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
  Send,
} from 'lucide-react';

interface InteractionFormProps {
  customerId: string;
  onCreated: () => void;
  onCancel: () => void;
}

const interactionTypes = [
  { value: 'nota', label: 'Nota', icon: StickyNote, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' },
  { value: 'llamada', label: 'Llamada', icon: Phone, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' },
  { value: 'email', label: 'Email', icon: Mail, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  { value: 'visita', label: 'Visita', icon: MapPin, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  { value: 'alarma', label: 'Alarma', icon: Bell, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
  { value: 'recordatorio', label: 'Recordatorio', icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
];

export default function InteractionForm({ customerId, onCreated, onCancel }: InteractionFormProps) {
  const [type, setType] = useState('nota');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const needsSchedule = type === 'visita' || type === 'alarma' || type === 'recordatorio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const payload: any = {
      customerId,
      userId: user.id,
      type,
      content: content || undefined,
    };

    if (needsSchedule && scheduledAt) {
      payload.scheduledAt = new Date(scheduledAt).toISOString();
    }

    if (reminderAt) {
      payload.reminderAt = new Date(reminderAt).toISOString();
    }

    setSubmitting(true);
    try {
      await api.post('/interactions', payload);
      setContent('');
      setScheduledAt('');
      setReminderAt('');
      onCreated();
    } catch (error) {
      console.error('Error creating interaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Nueva Actividad</h3>

      {/* Type Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {interactionTypes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                type === t.value
                  ? `${t.color} ring-2 ring-primary/30`
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content */}
        <div>
          <label className="text-sm font-medium text-card-foreground block mb-1.5">
            {type === 'alarma' ? '¿Qué quieres que suene la alarma?' :
             type === 'recordatorio' ? '¿Qué recordar?' :
             type === 'visita' ? 'Detalles de la visita' :
             'Descripción'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-background text-card-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
            placeholder={
              type === 'nota' ? 'Ej: El cliente preguntó por el modelo X...' :
              type === 'llamada' ? 'Ej: Hablamos sobre la cotización pendiente...' :
              type === 'whatsapp' ? 'Ej: Le envié el catálogo por WhatsApp...' :
              type === 'email' ? 'Ej: Le envié la propuesta comercial...' :
              type === 'visita' ? 'Ej: Visita a las instalaciones para ver la sala...' :
              type === 'alarma' ? 'Ej: Llamar al cliente para confirmar cita...' :
              'Ej: Recordar enviar la cotización actualizada...'
            }
          />
        </div>

        {/* Scheduled Date/Time for visits, alarms, reminders */}
        {needsSchedule && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-card-foreground block mb-1.5">
                {type === 'visita' ? 'Fecha y hora de la visita' :
                 type === 'alarma' ? 'Fecha y hora de la alarma' :
                 'Fecha y hora del recordatorio'}
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground block mb-1.5">
                Recordar antes (opcional)
              </label>
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-border text-card-foreground font-medium hover:bg-muted/50 transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
