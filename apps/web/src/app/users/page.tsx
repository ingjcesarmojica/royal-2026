'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/sidebar';
import {
  Plus,
  Search,
  UserCog,
  X,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  vendedor: 'Vendedor',
  soporte: 'Soporte',
  lectura: 'Solo lectura',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  vendedor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  soporte: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  lectura: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'vendedor',
  });

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
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', password: '', role: 'vendedor' });
    setShowModal(true);
  };

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        const payload: any = { fullName: formData.fullName, role: formData.role };
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('Usuario actualizado');
      } else {
        await api.post('/users', formData);
        toast.success('Usuario creado');
      }
      setShowModal(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('¿Está seguro de desactivar este usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Usuario desactivado');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al desactivar usuario');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <UserCog className="w-8 h-8 text-purple-600" />
              Usuarios
            </h1>
            <p className="text-muted-foreground mt-1">{users.length} usuarios registrados (máximo 5)</p>
          </div>
          <button
            onClick={openCreateModal}
            disabled={users.length >= 5}
            className="inline-flex items-center gap-2 px-5 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-royal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
                    {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground">{user.fullName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || ''}`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {user.active ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    <UserCheck className="w-3.5 h-3.5" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    <UserX className="w-3.5 h-3.5" />
                    Inactivo
                  </span>
                )}
                {user.id === currentUser?.id && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    <Shield className="w-3.5 h-3.5" />
                    Tú
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 px-3 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                >
                  Editar
                </button>
                {user.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDeactivate(user.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Desactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCog className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">No se encontraron usuarios</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-card-foreground">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                    placeholder="juan@email.com"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1.5">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    Rol *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  >
                    <option value="admin">Administrador</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="soporte">Soporte</option>
                    <option value="lectura">Solo lectura</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.fullName || !formData.email || (!editingUser && !formData.password)}
                    className="px-5 py-2.5 text-sm font-medium gradient-primary text-white rounded-xl hover:shadow-royal transition-all duration-300 disabled:opacity-50"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'}
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
