'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import {
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  User,
  X,
  Users,
  Filter,
  UserCheck,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  status: { name: string; color: string };
  owner: { fullName: string; id: string };
  ownerId: string;
  createdAt: string;
}

interface UserOption {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [assignModal, setAssignModal] = useState<{ customerId: string; currentOwner: string } | null>(null);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      if (user.role === 'admin') {
        loadUsers();
      }
    }
    loadCustomers();

    const interval = setInterval(loadCustomers, 2 * 60 * 1000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadCustomers();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      toast.success('Cliente creado exitosamente');
      setShowModal(false);
      setFormData({ fullName: '', company: '', email: '', phone: '', notes: '' });
      loadCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear cliente');
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !selectedOwner || assigning) return;
    setAssigning(true);
    try {
      await api.put(`/customers/${assignModal.customerId}/assign`, { ownerId: selectedOwner });
      toast.success('Cliente asignado exitosamente');
      setAssignModal(null);
      setSelectedOwner('');
      loadCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al asignar cliente');
    } finally {
      setAssigning(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const sellerOptions = users.filter((u) => u.id !== currentUser?.id);
  const vendedores = sellerOptions.filter((u) => u.role === 'vendedor');
  const assignOptions = vendedores.length > 0 ? vendedores : sellerOptions;
  const assignCustomer = assignModal
    ? customers.find((c) => c.id === assignModal.customerId)
    : null;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isAdmin ? 'Todos los Clientes' : 'Mis Clientes'}
            </h1>
            <p className="text-muted-foreground mt-1">{customers.length} clientes registrados</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-royal transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl hover:bg-accent transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Vendedor
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} onClick={() => router.push(`/customers/${customer.id}`)} className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {customer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{customer.fullName}</p>
                          <p className="text-xs text-muted-foreground">{customer.email || 'Sin email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-card-foreground">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {customer.company || <span className="text-muted-foreground italic">Sin empresa</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                            <Phone className="w-3.5 h-3.5 text-green-500" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.status ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: customer.status.color + '20',
                            color: customer.status.color,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: customer.status.color }}
                          />
                          {customer.status.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin estado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-card-foreground">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm">{customer.owner?.fullName || 'Sin asignar'}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignModal({ customerId: customer.id, currentOwner: customer.ownerId || '' });
                            setSelectedOwner(customer.ownerId || '');
                            if (users.length === 0) loadUsers();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Asignar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground font-medium">No se encontraron clientes</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {search ? 'Intenta con otro término de búsqueda' : 'Crea tu primer cliente para comenzar'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-card-foreground">Nuevo Cliente</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    Empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="juan@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    Notas
                  </label>
                  <textarea
                    placeholder="Información adicional sobre el cliente..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium gradient-primary text-white rounded-xl hover:shadow-royal transition-all duration-300"
                  >
                    Crear Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {assignModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setAssignModal(null)}
          >
            <div
              className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">Asignar Cliente</h2>
                  {assignCustomer && (
                    <p className="text-sm text-muted-foreground mt-0.5">{assignCustomer.fullName}</p>
                  )}
                </div>
                <button
                  onClick={() => setAssignModal(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Seleccionar vendedor
                  </label>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {assignOptions.map((u) => {
                      const selected = selectedOwner === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSelectedOwner(u.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                            selected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                              : 'border-border bg-background hover:bg-muted'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {u.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-card-foreground truncate">
                              {u.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selected ? 'border-primary bg-primary' : 'border-border'
                            }`}
                          >
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                    {assignOptions.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No hay vendedores disponibles
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setAssignModal(null)}
                    className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedOwner || assigning}
                    className="px-5 py-2.5 text-sm font-medium gradient-primary text-white rounded-xl hover:shadow-royal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {assigning && (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    Asignar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
