'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import { api } from '@/lib/api';
import { Package, Search, Filter, Eye, Edit, Trash2, Plus, X, Save, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  model: string;
  description?: string;
  category: string;
  positions?: number;
  diameterCm?: number;
  basePrice: number;
  imageUrl?: string;
  features?: Record<string, any>;
  active: boolean;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  ruleta: 'Ruleta',
  terminal: 'Terminal',
  gabinete: 'Gabinete',
};

const categoryColors: Record<string, string> = {
  ruleta: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  terminal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  gabinete: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const productImages: Record<string, string> = {
  'XR-8': 'https://www.royalxr.com/nuevas_imagenes/PNG/Catalogo_Royal_01-p%C3%A1ginas-2.webp',
  'XR-6': 'https://www.royalxr.com/nuevas_imagenes/PNG/Catalogo_Royal_01-p%C3%A1ginas-3.webp',
  'XS-6': 'https://www.royalxr.com/nuevas_imagenes/PNG/Catalogo_Royal_01-p%C3%A1ginas-4.webp',
  'XP-5': 'https://www.royalxr.com/nuevas_imagenes/PNG/Catalogo_Royal_01-p%C3%A1ginas-5.webp',
  'XP-4': 'https://www.royalxr.com/nuevas_imagenes/PNG/Catalogo_Royal_01-p%C3%A1ginas-6.webp',
  'XT': 'https://www.royalxr.com/nuevas_imagenes/PNG/Catalogo_Royal_01-p%C3%A1ginas-7.webp',
  'XG': 'https://www.royalxr.com/nuevas_imagenes/PNG/Catalogo_Royal_01-p%C3%A1ginas-8.webp',
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    description: '',
    category: 'ruleta',
    positions: '',
    diameterCm: '',
    basePrice: '',
    imageUrl: '',
    active: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadProducts();
  }, [router]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterCategory) params.append('category', filterCategory);
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, filterCategory]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      model: '',
      description: '',
      category: 'ruleta',
      positions: '',
      diameterCm: '',
      basePrice: '',
      imageUrl: '',
      active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      model: product.model,
      description: product.description || '',
      category: product.category,
      positions: product.positions?.toString() || '',
      diameterCm: product.diameterCm?.toString() || '',
      basePrice: product.basePrice.toString(),
      imageUrl: product.imageUrl || '',
      active: product.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        positions: formData.positions ? parseInt(formData.positions) : null,
        diameterCm: formData.diameterCm ? parseFloat(formData.diameterCm) : null,
        basePrice: parseFloat(formData.basePrice),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Producto actualizado');
      } else {
        await api.post('/products', payload);
        toast.success('Producto creado');
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      toast.error('Error al guardar producto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto eliminado');
      loadProducts();
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Package className="w-8 h-8 text-purple-600" />
                Productos
              </h1>
              <p className="text-muted-foreground mt-1">Catálogo de ruletas y equipos Royal Gaming</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las categorías</option>
              <option value="ruleta">Ruletas</option>
              <option value="terminal">Terminales</option>
              <option value="gabinete">Gabinetes</option>
            </select>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No hay productos</h3>
              <p className="text-muted-foreground">Comience agregando un nuevo producto</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden">
                    {(product.imageUrl || productImages[product.model]) ? (
                      <img
                        src={product.imageUrl || productImages[product.model]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Package className={`w-20 h-20 text-white/30 ${product.imageUrl || productImages[product.model] ? 'hidden' : ''}`} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">Modelo: {product.model}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[product.category] || ''}`}>
                        {categoryLabels[product.category]}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex gap-2 mb-3 text-sm">
                      {product.positions && (
                        <span className="bg-muted px-2 py-1 rounded">{product.positions} pos.</span>
                      )}
                      {product.diameterCm && (
                        <span className="bg-muted px-2 py-1 rounded">{product.diameterCm}cm</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-purple-600">{formatCurrency(product.basePrice)}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl border border-border w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: XR-8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Modelo *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: XR-8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Descripción del producto..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Categoría *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="ruleta">Ruleta</option>
                      <option value="terminal">Terminal</option>
                      <option value="gabinete">Gabinete</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Posiciones</label>
                    <input
                      type="number"
                      value={formData.positions}
                      onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Diámetro (cm)</label>
                    <input
                      type="number"
                      value={formData.diameterCm}
                      onChange={(e) => setFormData({ ...formData, diameterCm: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Precio Base (COP) *</label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="45000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">URL de Imagen</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-foreground">Activo</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-border">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.model || !formData.basePrice}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
