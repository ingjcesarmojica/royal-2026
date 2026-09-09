'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import { GripVertical, Phone, Mail, Users, Kanban } from 'lucide-react';

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
}

export default function PipelinePage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

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
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <h3 className="font-semibold text-card-foreground">{status.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-background rounded-full text-muted-foreground border border-border">
                    {statusCustomers.length}
                  </span>
                </div>

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
    </div>
  );
}
