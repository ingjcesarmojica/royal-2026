'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import InteractionForm from '@/components/customers/interaction-form';
import InteractionTimeline from '@/components/customers/interaction-timeline';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Tag,
  Clock,
  Edit2,
} from 'lucide-react';

interface CustomerDetail {
  id: string;
  fullName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  source: string;
  notes?: string;
  statusId?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; fullName: string };
  status?: { id: number; name: string; color: string };
  interactions: Interaction[];
  messages: any[];
}

interface Interaction {
  id: string;
  type: string;
  content?: string;
  scheduledAt?: string;
  reminderAt?: string;
  completed: boolean;
  createdAt: string;
  user: { id: string; fullName: string };
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      const res = await api.get(`/customers/${customerId}`);
      setCustomer(res.data);
      setNotesValue(res.data.notes || '');
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.put(`/customers/${customerId}`, { notes: notesValue });
      setCustomer((prev) => prev ? { ...prev, notes: notesValue } : prev);
      setEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleInteractionCreated = () => {
    setShowForm(false);
    loadCustomer();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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

  if (!customer) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">Cliente no encontrado</p>
            <button
              onClick={() => router.push('/customers')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              Volver a Clientes
            </button>
          </div>
        </main>
      </div>
    );
  }

  const pendingReminders = customer.interactions.filter(
    (i) => i.type === 'recordatorio' && !i.completed && i.scheduledAt
  );
  const pendingAlarms = customer.interactions.filter(
    (i) => i.type === 'alarma' && !i.completed && i.scheduledAt
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/customers')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Clientes
          </button>
        </div>

        {/* Customer Info Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold">
                {customer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">{customer.fullName}</h1>
                {customer.company && (
                  <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building2 className="w-4 h-4" />
                    {customer.company}
                  </p>
                )}
              </div>
            </div>
            {customer.status && (
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: customer.status.color }}
              >
                {customer.status.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {customer.email}
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {customer.address}
              </div>
            )}
            {customer.owner && (
              <div className="flex items-center gap-2 text-sm text-card-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                {customer.owner.fullName}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-card-foreground">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {customer.source === 'csv_import' ? 'CSV' : customer.source === 'web_form' ? 'Web' : 'Manual'}
            </div>
            <div className="flex items-center gap-2 text-sm text-card-foreground">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Creado: {formatDate(customer.createdAt)}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Notas</h3>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Editar
                </button>
              )}
            </div>
            {editingNotes ? (
              <div>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-card-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  placeholder="Notas sobre el cliente..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotes(false);
                      setNotesValue(customer.notes || '');
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-card-foreground hover:bg-muted/50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-card-foreground">
                {customer.notes || 'Sin notas'}
              </p>
            )}
          </div>
        </div>

        {/* Pending Reminders & Alarms */}
        {(pendingReminders.length > 0 || pendingAlarms.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {pendingAlarms.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Alarmas pendientes ({pendingAlarms.length})
                </h3>
                <div className="space-y-2">
                  {pendingAlarms.map((alarm) => (
                    <div key={alarm.id} className="bg-white dark:bg-red-900/30 rounded-lg p-3 text-sm">
                      <p className="text-card-foreground">{alarm.content || 'Sin descripción'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(alarm.scheduledAt!)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pendingReminders.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recordatorios pendientes ({pendingReminders.length})
                </h3>
                <div className="space-y-2">
                  {pendingReminders.map((reminder) => (
                    <div key={reminder.id} className="bg-white dark:bg-amber-900/30 rounded-lg p-3 text-sm">
                      <p className="text-card-foreground">{reminder.content || 'Sin descripción'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(reminder.scheduledAt!)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Interaction Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            {showForm ? 'Cancelar' : '+ Registrar Actividad'}
          </button>
        </div>

        {/* Interaction Form */}
        {showForm && (
          <div className="mb-6">
            <InteractionForm
              customerId={customerId}
              onCreated={handleInteractionCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Interaction Timeline */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Historial de Actividad</h3>
          </div>
          <InteractionTimeline
            interactions={customer.interactions}
            onDeleted={loadCustomer}
          />
        </div>
      </main>
    </div>
  );
}
