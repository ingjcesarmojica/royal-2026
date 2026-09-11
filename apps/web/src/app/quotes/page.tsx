'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import { api } from '@/lib/api';
import {
  FileText, Search, Plus, Edit, Trash2, X, Save, Send,
  Eye, Download, ChevronDown, ChevronUp, Image as ImageIcon,
  Mail, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  model: string;
  basePrice: number;
  category: string;
}

interface Customer {
  id: string;
  fullName: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface QuoteItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

interface Quote {
  id: string;
  customerId: string;
  customer?: Customer;
  userId: string;
  user?: any;
  title: string;
  status: string;
  validityDays: number;
  deliveryTime?: string;
  notes?: string;
  discountPercent: number;
  subtotal: number;
  total: number;
  headerConfig?: any;
  bannerConfig?: any;
  footerConfig?: any;
  items?: QuoteItem[];
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  borrador: { label: 'Borrador', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', icon: Edit },
  enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Send },
  aprobada: { label: 'Aprobada', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
  vencida: { label: 'Vencida', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: AlertCircle },
};

export default function QuotesPage() {
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    banner: false,
    items: true,
    footer: false,
  });

  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    deliveryTime: '60 días',
    notes: '',
    discountPercent: 0,
    validityDays: 30,
    headerConfig: {
      companyName: 'Royal Gaming',
      logoUrl: '',
      address: '',
      phone: '',
      email: '',
      nit: '',
    },
    bannerConfig: {
      enabled: false,
      imageUrl: '',
      text: '¡Oferta Especial!',
      backgroundColor: '#7c3aed',
    },
    footerConfig: {
      logoUrl: '',
      text: 'Gracias por su preferencia',
      contactEmail: '',
      contactPhone: '',
      website: 'royalxr.com',
    },
  });

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [quotesRes, productsRes, customersRes] = await Promise.all([
        api.get('/quotes'),
        api.get('/products?active=true'),
        api.get('/customers'),
      ]);
      setQuotes(quotesRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const openCreateEditor = () => {
    setEditingQuote(null);
    setFormData({
      customerId: '',
      title: '',
      deliveryTime: '60 días',
      notes: '',
      discountPercent: 0,
      validityDays: 30,
      headerConfig: { companyName: 'Royal Gaming', logoUrl: '', address: '', phone: '', email: '', nit: '' },
      bannerConfig: { enabled: false, imageUrl: '', text: '¡Oferta Especial!', backgroundColor: '#7c3aed' },
      footerConfig: { logoUrl: '', text: 'Gracias por su preferencia', contactEmail: '', contactPhone: '', website: 'royalxr.com' },
    });
    setQuoteItems([]);
    setShowEditor(true);
  };

  const openEditEditor = async (quote: Quote) => {
    try {
      const { data } = await api.get(`/quotes/${quote.id}`);
      setEditingQuote(data);
      setFormData({
        customerId: data.customerId,
        title: data.title,
        deliveryTime: data.deliveryTime || '',
        notes: data.notes || '',
        discountPercent: data.discountPercent,
        validityDays: data.validityDays,
        headerConfig: data.headerConfig || { companyName: 'Royal Gaming', logoUrl: '', address: '', phone: '', email: '', nit: '' },
        bannerConfig: data.bannerConfig || { enabled: false, imageUrl: '', text: '¡Oferta Especial!', backgroundColor: '#7c3aed' },
        footerConfig: data.footerConfig || { logoUrl: '', text: 'Gracias por su preferencia', contactEmail: '', contactPhone: '', website: 'royalxr.com' },
      });
      setQuoteItems(data.items || []);
      setShowEditor(true);
    } catch (error) {
      toast.error('Error al cargar cotización');
    }
  };

  const addItem = () => {
    setQuoteItems([
      ...quoteItems,
      { productId: '', quantity: 1, unitPrice: 0, discountPercent: 0, subtotal: 0 },
    ]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...quoteItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].unitPrice = product.basePrice;
        newItems[index].product = product;
      }
    }

    newItems[index].subtotal =
      newItems[index].quantity *
      newItems[index].unitPrice *
      (1 - newItems[index].discountPercent / 100);

    setQuoteItems(newItems);
  };

  const removeItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal * (1 - formData.discountPercent / 100);
    return { subtotal, total };
  };

  const handleSave = async (status: string = 'borrador') => {
    try {
      const { subtotal, total } = calculateTotals();
      const payload = {
        ...formData,
        status,
        subtotal,
        total,
        items: quoteItems,
      };

      if (editingQuote) {
        await api.put(`/quotes/${editingQuote.id}`, payload);
        toast.success('Cotización actualizada');
      } else {
        await api.post('/quotes', payload);
        toast.success('Cotización creada');
      }
      setShowEditor(false);
      loadData();
    } catch (error) {
      toast.error('Error al guardar cotización');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
    try {
      await api.delete(`/quotes/${id}`);
      toast.success('Cotización eliminada');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar cotización');
    }
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const quote = previewQuote || {
      ...formData,
      items: quoteItems,
      ...calculateTotals(),
      customer: customers.find((c) => c.id === formData.customerId),
    };

    const itemsHTML = (quote.items || [])
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.product?.name || item.productId}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.discountPercent}%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formatCurrency(item.subtotal)}</td>
        </tr>
      `
      )
      .join('');

    const bannerHTML = quote.bannerConfig?.enabled
      ? `<div style="background-color: ${quote.bannerConfig.backgroundColor || '#7c3aed'}; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
           <h2 style="margin: 0; font-size: 24px;">${quote.bannerConfig.text || '¡Oferta Especial!'}</h2>
         </div>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cotización - ${quote.title || 'Cotización'}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #1f2937; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; }
          .company-info h1 { margin: 0; color: #7c3aed; font-size: 28px; }
          .company-info p { margin: 5px 0; color: #6b7280; }
          .quote-info { text-align: right; }
          .quote-info h2 { margin: 0; color: #7c3aed; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #7c3aed; color: white; padding: 12px 10px; text-align: left; }
          th:nth-child(2), th:nth-child(4) { text-align: center; }
          th:nth-child(3), th:nth-child(5) { text-align: right; }
          .totals { display: flex; justify-content: flex-end; margin-top: 20px; }
          .totals-box { background: #f3f4f6; padding: 20px; border-radius: 8px; min-width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .totals-row.total { border-top: 2px solid #7c3aed; font-weight: bold; font-size: 18px; color: #7c3aed; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
          .notes { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>${quote.headerConfig?.companyName || 'Royal Gaming'}</h1>
            ${quote.headerConfig?.address ? `<p>${quote.headerConfig.address}</p>` : ''}
            ${quote.headerConfig?.phone ? `<p>Tel: ${quote.headerConfig.phone}</p>` : ''}
            ${quote.headerConfig?.email ? `<p>${quote.headerConfig.email}</p>` : ''}
            ${quote.headerConfig?.nit ? `<p>NIT: ${quote.headerConfig.nit}</p>` : ''}
          </div>
          <div class="quote-info">
            <h2>COTIZACIÓN</h2>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
            <p><strong>Válida por:</strong> ${quote.validityDays || 30} días</p>
            <p><strong>Entrega:</strong> ${quote.deliveryTime || '60 días'}</p>
          </div>
        </div>

        ${bannerHTML}

        <div style="margin-bottom: 20px;">
          <h3 style="color: #7c3aed; margin-bottom: 10px;">Cliente</h3>
          <p><strong>${quote.customer?.fullName || 'No seleccionado'}</strong></p>
          ${quote.customer?.company ? `<p>${quote.customer.company}</p>` : ''}
          ${quote.customer?.email ? `<p>${quote.customer.email}</p>` : ''}
          ${quote.customer?.phone ? `<p>${quote.customer.phone}</p>` : ''}
        </div>

        <h3 style="color: #7c3aed; margin-bottom: 10px;">Detalle de Productos</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Descuento</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(quote.subtotal || 0)}</span>
            </div>
            ${quote.discountPercent > 0 ? `
            <div class="totals-row">
              <span>Descuento (${quote.discountPercent}%):</span>
              <span>-${formatCurrency((quote.subtotal || 0) * (quote.discountPercent / 100))}</span>
            </div>
            ` : ''}
            <div class="totals-row total">
              <span>TOTAL:</span>
              <span>${formatCurrency(quote.total || 0)}</span>
            </div>
          </div>
        </div>

        ${quote.notes ? `<div class="notes"><h4 style="margin-top:0;">Notas</h4><p>${quote.notes}</p></div>` : ''}

        <div class="footer">
          ${quote.footerConfig?.logoUrl ? `<img src="${quote.footerConfig.logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;">` : ''}
          <p>${quote.footerConfig?.text || 'Gracias por su preferencia'}</p>
          ${quote.footerConfig?.contactEmail ? `<p>Email: ${quote.footerConfig.contactEmail}</p>` : ''}
          ${quote.footerConfig?.contactPhone ? `<p>Tel: ${quote.footerConfig.contactPhone}</p>` : ''}
          ${quote.footerConfig?.website ? `<p>Web: ${quote.footerConfig.website}</p>` : ''}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const sendByEmail = async (quote: Quote) => {
    if (!quote.customer?.email) {
      toast.error('El cliente no tiene email registrado');
      return;
    }
    try {
      await api.post('/messages', {
        customerId: quote.customerId,
        channel: 'email',
        templateId: null,
        payload: {
          to: quote.customer.email,
          subject: `Cotización: ${quote.title}`,
          html: `Estimado ${quote.customer.fullName},<br><br>Adjuntamos la cotización: ${quote.title}<br><br>Saludos cordiales,<br>Royal Gaming`,
        },
      });
      toast.success('Email enviado');
    } catch (error) {
      toast.error('Error al enviar email');
    }
  };

  const sendByWhatsApp = (quote: Quote) => {
    if (!quote.customer?.phone) {
      toast.error('El cliente no tiene teléfono registrado');
      return;
    }
    const phone = quote.customer.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hola ${quote.customer.fullName}, le comparto la cotización: ${quote.title}\nTotal: ${formatCurrency(quote.total)}\nVálida por ${quote.validityDays} días.\n\nSaludos,\nRoyal Gaming`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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

  const { subtotal, total } = calculateTotals();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-600" />
                Cotizaciones
              </h1>
              <p className="text-muted-foreground mt-1">Gestión de cotizaciones para clientes</p>
            </div>
            <button
              onClick={openCreateEditor}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Cotización
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cotizaciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>

          {/* Quotes List */}
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No hay cotizaciones</h3>
              <p className="text-muted-foreground">Cree una nueva cotización para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes
                .filter((q) => {
                  const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.customer?.fullName?.toLowerCase().includes(search.toLowerCase());
                  const matchStatus = !filterStatus || q.status === filterStatus;
                  return matchSearch && matchStatus;
                })
                .map((quote) => {
                  const StatusIcon = statusConfig[quote.status]?.icon || Edit;
                  return (
                    <div key={quote.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-foreground">{quote.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[quote.status]?.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[quote.status]?.label}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Cliente: <strong className="text-foreground">{quote.customer?.fullName}</strong></span>
                            <span>Total: <strong className="text-purple-600">{formatCurrency(quote.total)}</strong></span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(quote.createdAt).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setPreviewQuote(quote); generatePDF(); }}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            title="Ver PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generatePDF()}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => sendByWhatsApp(quote)}
                            className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => sendByEmail(quote)}
                            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Enviar Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditEditor(quote)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(quote.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-card rounded-xl border border-border w-full max-w-4xl mx-4 my-8 max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-lg font-bold text-foreground">
                  {editingQuote ? 'Editar Cotización' : 'Nueva Cotización'}
                </h2>
                <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Cliente *</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccionar cliente...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.fullName} {c.company ? `(${c.company})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Título *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Cotización ruletas casino..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tiempo de Entrega</label>
                    <input
                      type="text"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="60 días"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Validez (días)</label>
                    <input
                      type="number"
                      value={formData.validityDays}
                      onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Header Config */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, header: !expandedSections.header })}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-foreground">Encabezado de la Cotización</span>
                    {expandedSections.header ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.header && (
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nombre de la Empresa</label>
                        <input
                          type="text"
                          value={formData.headerConfig.companyName}
                          onChange={(e) => setFormData({ ...formData, headerConfig: { ...formData.headerConfig, companyName: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Logo URL</label>
                        <input
                          type="text"
                          value={formData.headerConfig.logoUrl}
                          onChange={(e) => setFormData({ ...formData, headerConfig: { ...formData.headerConfig, logoUrl: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                        <input
                          type="text"
                          value={formData.headerConfig.address}
                          onChange={(e) => setFormData({ ...formData, headerConfig: { ...formData.headerConfig, address: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
                        <input
                          type="text"
                          value={formData.headerConfig.phone}
                          onChange={(e) => setFormData({ ...formData, headerConfig: { ...formData.headerConfig, phone: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.headerConfig.email}
                          onChange={(e) => setFormData({ ...formData, headerConfig: { ...formData.headerConfig, email: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">NIT</label>
                        <input
                          type="text"
                          value={formData.headerConfig.nit}
                          onChange={(e) => setFormData({ ...formData, headerConfig: { ...formData.headerConfig, nit: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Banner Config */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, banner: !expandedSections.banner })}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Banner Promocional
                    </span>
                    {expandedSections.banner ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.banner && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="bannerEnabled"
                          checked={formData.bannerConfig.enabled}
                          onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, enabled: e.target.checked } })}
                          className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="bannerEnabled" className="text-sm font-medium text-foreground">Habilitar Banner</label>
                      </div>
                      {formData.bannerConfig.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Texto del Banner</label>
                            <input
                              type="text"
                              value={formData.bannerConfig.text}
                              onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, text: e.target.value } })}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="¡Oferta Especial!"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Color de Fondo</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={formData.bannerConfig.backgroundColor}
                                onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, backgroundColor: e.target.value } })}
                                className="w-10 h-10 rounded border border-border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={formData.bannerConfig.backgroundColor}
                                onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, backgroundColor: e.target.value } })}
                                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">URL de Imagen (opcional)</label>
                            <input
                              type="text"
                              value={formData.bannerConfig.imageUrl}
                              onChange={(e) => setFormData({ ...formData, bannerConfig: { ...formData.bannerConfig, imageUrl: e.target.value } })}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, items: !expandedSections.items })}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-foreground">Productos ({quoteItems.length})</span>
                    {expandedSections.items ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.items && (
                    <div className="p-4">
                      <div className="space-y-3">
                        {quoteItems.map((item, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <select
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">Seleccionar producto...</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.basePrice)}</option>
                                ))}
                              </select>
                            </div>
                            <div className="w-20">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Cant."
                              />
                            </div>
                            <div className="w-32">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Precio"
                              />
                            </div>
                            <div className="w-20">
                              <input
                                type="number"
                                value={item.discountPercent}
                                onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="%"
                              />
                            </div>
                            <div className="w-28 text-right font-medium text-foreground py-2">
                              {formatCurrency(item.subtotal)}
                            </div>
                            <button
                              onClick={() => removeItem(index)}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addItem}
                        className="mt-3 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Producto
                      </button>

                      {/* Discount & Totals */}
                      <div className="mt-4 flex justify-end">
                        <div className="w-72 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Descuento General (%):</span>
                            <input
                              type="number"
                              value={formData.discountPercent}
                              onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                              min="0"
                              max="100"
                              className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                            <span className="text-foreground">TOTAL:</span>
                            <span className="text-purple-600">{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Config */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, footer: !expandedSections.footer })}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-foreground">Pie de Página</span>
                    {expandedSections.footer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.footer && (
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1">Logo URL</label>
                        <input
                          type="text"
                          value={formData.footerConfig.logoUrl}
                          onChange={(e) => setFormData({ ...formData, footerConfig: { ...formData.footerConfig, logoUrl: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1">Mensaje</label>
                        <input
                          type="text"
                          value={formData.footerConfig.text}
                          onChange={(e) => setFormData({ ...formData, footerConfig: { ...formData.footerConfig, text: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Gracias por su preferencia"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email de Contacto</label>
                        <input
                          type="email"
                          value={formData.footerConfig.contactEmail}
                          onChange={(e) => setFormData({ ...formData, footerConfig: { ...formData.footerConfig, contactEmail: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Teléfono de Contacto</label>
                        <input
                          type="text"
                          value={formData.footerConfig.contactPhone}
                          onChange={(e) => setFormData({ ...formData, footerConfig: { ...formData.footerConfig, contactPhone: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Sitio Web</label>
                        <input
                          type="text"
                          value={formData.footerConfig.website}
                          onChange={(e) => setFormData({ ...formData, footerConfig: { ...formData.footerConfig, website: e.target.value } })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Notas Adicionales</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Notas adicionales para la cotización..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between p-4 border-t border-border sticky bottom-0 bg-card">
                <button
                  onClick={() => { setPreviewQuote(null); generatePDF(); }}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
                >
                  <Eye className="w-4 h-4" />
                  Vista Previa PDF
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave('borrador')}
                    disabled={!formData.customerId || !formData.title}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-foreground"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Borrador
                  </button>
                  <button
                    onClick={() => handleSave('enviada')}
                    disabled={!formData.customerId || !formData.title || quoteItems.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Guardar y Enviar
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
