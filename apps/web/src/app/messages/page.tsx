'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import {
  Send,
  MessageSquare,
  Mail,
  Search,
  User,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !message.trim()) return;

    setSending(true);
    try {
      await api.post('/messages', {
        customerId: selectedCustomer.id,
        channel,
        direction: 'out',
        payload: { content: message },
      });
      toast.success('Mensaje enviado exitosamente');
      setMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

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
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mensajería</h1>
          <p className="text-muted-foreground mt-1">Envía mensajes por WhatsApp o Email</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* Customer List */}
          <div className="bg-card rounded-2xl border border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-card-foreground mb-3">Contactos</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 mb-1 ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {customer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground text-sm truncate">{customer.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        {customer.phone ? (
                          <>
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </>
                        ) : (
                          <>
                            <Mail className="w-3 h-3" />
                            {customer.email || 'Sin contacto'}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="py-8 text-center">
                  <User className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-muted-foreground">Sin contactos</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Composer */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border flex flex-col">
            {selectedCustomer ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {selectedCustomer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{selectedCustomer.fullName}</p>
                    <p className="text-xs text-muted-foreground">{selectedCustomer.phone || selectedCustomer.email}</p>
                  </div>
                </div>

                {/* Channel Toggle */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2 p-1 bg-background rounded-xl">
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        channel === 'whatsapp'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : 'text-muted-foreground hover:text-card-foreground'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        channel === 'email'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : 'text-muted-foreground hover:text-card-foreground'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <form onSubmit={handleSend} className="flex-1 flex flex-col p-4">
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        channel === 'whatsapp'
                          ? 'Escribe tu mensaje de WhatsApp...'
                          : 'Escribe tu mensaje de email...'
                      }
                      className="w-full h-full min-h-[200px] px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-muted-foreground">
                      {channel === 'whatsapp' ? 'Envío vía WhatsApp Business API' : 'Envío vía email transaccional'}
                    </p>
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl font-medium hover:shadow-royal transition-all duration-300 disabled:opacity-50"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {sending ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground font-medium">Selecciona un contacto</p>
                  <p className="text-sm text-muted-foreground mt-1">para enviar un mensaje</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
