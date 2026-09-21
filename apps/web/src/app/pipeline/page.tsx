'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import {
  GripVertical,
  Phone,
  Mail,
  Users,
  Kanban,
  X,
  ExternalLink,
  MessageSquare,
  Calendar,
} from 'lucide-react';

interface Status {
  id: number;
  name: string;
  color: string;
  order: number;
}

interface Customer {
  id: string;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  statusId: string;
  createdAt: string;
}

export default function PipelinePage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusesRes, customersRes] = await Promise.all([
        api.get('/statuses'),
        api.get('/customers'),
      ]);
      setStatuses(statusesRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomersByStatus = (statusId: number) => {
    return customers.filter((c) => c.statusId === String(statusId));
  };

  const handleDragStart = (e: React.DragEvent, customerId: string) => {
    e.dataTransfer.setData('customerId', customerId);
  };

  const handleDrop = async (e: React.DragEvent, statusId: number) => {
    e.preventDefault();
    const customerId = e.dataTransfer.getData('customerId');
    if (customerId) {
      try {
        await api.put(`/customers/${customerId}/status`, { statusId: String(statusId) });
        loadData();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const handleStatusClick = (status: Status) => {
    setSelectedStatus(status);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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

  const modalCustomers = selectedStatus ? getCustomersByStatus(selectedStatus.id) : [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pipeline de Ventas</h1>
          <p className="text-muted-foreground mt-1">Arrastra las tarjetas para mover entre estados</p>
        </div>

        <div className="flex gap-5 min-w-max pb-4">
          {statuses.map((status) => {
            const statusCustomers = getCustomersByStatus(status.id);
            return (
              <div
                key={status.id}
                className="w-80 bg-muted/50 rounded-2xl p-4 border border-border"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, status.id)}
              >
                {/* Column Header - Clickable */}
                <button
                  onClick={() => handleStatusClick(status)}
                  className="w-full flex items-center justify-between mb-4 p-2 -m-2 rounded-xl hover:bg-background/50 transition-colors cursor-pointer group/header"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <h3 className="font-semibold text-card-foreground group-hover/header:text-primary transition-colors">
                      {status.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 text-xs font-bold rounded-full text-white"
                      style={{ backgroundColor: status.color }}
                    >
                      {statusCustomers.length}
                    </span>
                    <Users className="w-4 h-4 text-muted-foreground opacity-0 group-hover/header:opacity-100 transition-opacity" />
                  </div>
                </button>

                {/* Cards */}
                <div className="space-y-3">
                  {statusCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, customer.id)}
                      className="bg-card p-4 rounded-xl border border-border cursor-move hover:shadow-lg hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: status.color }}
                          >
                            {customer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-card-foreground text-sm">{customer.fullName}</h4>
                            {customer.company && (
                              <p className="text-xs text-muted-foreground">{customer.company}</p>
                            )}
                          </div>
                        </div>
                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {customer.phone.slice(0, 12)}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {statusCustomers.length === 0 && (
                    <div className="py-8 text-center">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                      <p className="text-xs text-muted-foreground">Sin clientes</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal: Lista de clientes por etapa */}
      {selectedStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStatus(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedStatus.color }}
                />
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">{selectedStatus.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {modalCustomers.length} {modalCustomers.length === 1 ? 'cliente' : 'clientes'} en esta etapa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStatus(null)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalCustomers.length > 0 ? (
                <div className="space-y-3">
                  {modalCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: selectedStatus.color }}
                        >
                          {customer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground">{customer.fullName}</h4>
                          <div className="flex items-center gap-3 mt-0.5">
                            {customer.company && (
                              <span className="text-xs text-muted-foreground">{customer.company}</span>
                            )}
                            {customer.phone && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </span>
                            )}
                            {customer.email && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(customer.createdAt)}
                        </span>
                        <button
                          onClick={() => router.push(`/customers`)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Ver en Clientes"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">No hay clientes en esta etapa</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Arrastra tarjetas desde otras columnas para moverlas aquí
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setSelectedStatus(null)}
                className="w-full px-4 py-2 text-sm font-medium rounded-xl border border-border text-card-foreground hover:bg-muted/50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
