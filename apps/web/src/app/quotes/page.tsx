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
  positions?: number;
  diameterCm?: number;
  imageUrl?: string;
  features?: Record<string, any>;
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

    const productImages: Record<string, string> = {
      'XR-8': '/images/products/xr8.webp',
      'XR-6': '/images/products/xr6.webp',
      'XS-6': '/images/products/xs6.webp',
      'XP-5': '/images/products/xp5.webp',
      'XP-4': '/images/products/xp4.webp',
      'XT': '/images/products/xt.webp',
      'XG': '/images/products/xg.webp',
    };

    const today = new Date().toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const customerName = quote.customer?.fullName || '';
    const firstName = customerName.split(' ')[0] || '';

    const companyAddress = quote.headerConfig?.address || 'Cra. 70C 50-08 Bogotá D.C., Colombia';
    const companyPhone = quote.headerConfig?.phone || '+57 320 495 0576';
    const companyEmail = quote.headerConfig?.email || 'info@royalxr.com';
    const companyName = quote.headerConfig?.companyName || 'Royal Gaming';
    const website = quote.footerConfig?.website || 'www.royalxr.com';

    const logoUrl = quote.headerConfig?.logoUrl || '/images/brand/logo-royal.png';

    const productCardsHTML = (quote.items || [])
      .map((item: any) => {
        const model = item.product?.model || '';
        const imgSrc = productImages[model] || item.product?.imageUrl || '';
        const features = item.product?.features || {};
        const featureList = Object.entries(features)
          .map(([key, val]) => `<li>${val === true ? key : val}</li>`)
          .join('');

        return `
          <div class="page">
            <div class="page-body">
              <h2 class="product-title">ROYAL ${model}</h2>
              <div class="product-content">
                <div class="product-specs">
                  <ul style="list-style:none;padding:0;margin:10px 0;">
                    ${item.product?.diameterCm ? `<li>• Superficie: ${item.product.diameterCm}mm</li>` : ''}
                    ${item.product?.positions ? `<li>• ${item.product.positions} estaciones de Juego</li>` : ''}
                    <li>• 8 computadores independientes.</li>
                    <li>• 8 Billeteros de última generación.</li>
                    <li>• Monitores LCD de 24"</li>
                    <li>• Interfaz HD táctil de respuesta inmediata.</li>
                    <li>• 2 cargadores para colgar, para una mejor experiencia y estabilidad de los clientes.</li>
                    <li>• Protocolo SAS de comunicaciones conforme a los nuevos requerimientos de Coljuegos.</li>
                    <li>• JACKPOT DE 4 NIVELES y MULTIPLICADORES DE APUESTA</li>
                    ${featureList}
                  </ul>
                </div>
                <div class="product-image">
                  ${imgSrc ? `<img src="${imgSrc}" style="max-width:100%;max-height:260px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">` : ''}
                </div>
              </div>
              <div class="commercial-offer">
                <h3>OFERTA COMERCIAL DE VENTA: ${model} – ${item.quantity} POSICIONES</h3>
                <p><strong>Precio de Lista:</strong> ${formatCurrency(item.unitPrice)} por posición</p>
                <p><strong>Cantidad:</strong> ${item.quantity} posiciones</p>
                ${item.discountPercent > 0 ? `<p><strong>Descuento:</strong> ${item.discountPercent}%</p>` : ''}
                <p><strong>Subtotal:</strong> ${formatCurrency(item.subtotal)}</p>
                <p class="offer-note">Financiación en Pesos Colombianos - Precio fijo sin variación del dólar</p>
                <p class="offer-note">Pago del 30% a la entrega, aproximadamente 60 días después de la orden de producción.</p>
              </div>
            </div>
          </div>`;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Propuesta Comercial - ${quote.title || companyName}</title>
        <style>
          @page { margin: 0; size: A4; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; font-size: 12px; line-height: 1.5; }

          .page {
            width: 210mm; min-height: 297mm; position: relative;
            background: white; page-break-after: always; overflow: hidden;
          }
          .page:last-child { page-break-after: auto; }

          /* HEADER FIXED - se repite en cada hoja */
          .header-fixed {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            background: white;
          }
          .header-bar {
            display: flex; justify-content: space-between; align-items: center;
            padding: 8mm 20mm 4mm 20mm;
          }
          .header-title { font-size: 22px; font-weight: bold; color: #1565c0; letter-spacing: 1px; }
          .header-logo { text-align: right; }
          .header-gradient {
            height: 6px; margin: 0 20mm;
            background: linear-gradient(90deg, #1a1a2e 0%, #d4a843 30%, #f5c842 50%, #d4a843 70%, #1a1a2e 100%);
            border-radius: 3px;
          }

          /* FOOTER FIXED - se repite en cada hoja */
          .footer-fixed {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          }
          .footer-gradient {
            height: 4px;
            background: linear-gradient(90deg, #1a1a2e 0%, #d4a843 30%, #f5c842 50%, #d4a843 70%, #1a1a2e 100%);
          }
          .footer-content {
            background: #1a1a2e; color: #ccc; padding: 6px 20mm;
            display: flex; justify-content: center; align-items: center;
            gap: 12px; font-size: 9px; flex-wrap: wrap;
          }
          .footer-sep { color: #d4a843; font-size: 6px; }

          /* CONTENIDO DE CADA PAGINA - respeta header/footer fijos */
          .page-body { padding: 38mm 20mm 30mm 20mm; }

          /* PAGE 1 */
          .date-line { font-size: 12px; color: #555; margin-bottom: 15px; }
          .customer-block { line-height: 1.8; margin-bottom: 15px; }
          .customer-block p { margin: 2px 0; }
          .ref-line { font-size: 11px; color: #555; margin-bottom: 15px; font-weight: bold; }
          .greeting { font-size: 12px; margin-bottom: 12px; }
          .intro-text { font-size: 12px; line-height: 1.7; margin-bottom: 20px; color: #333; }
          .features-section { margin-bottom: 20px; }
          .features-section h3 { color: #1a1a2e; font-size: 14px; margin-bottom: 8px; }
          .features-section h4 { color: #555; font-size: 12px; margin: 8px 0 5px 0; }
          .features-section ul { padding-left: 20px; margin: 5px 0; }
          .features-section li { margin: 4px 0; line-height: 1.5; }
          .featured-product { margin-top: 15px; }

          /* PRODUCT PAGES */
          .product-title { font-size: 20px; color: #1a1a2e; border-bottom: 2px solid #d4a843; padding-bottom: 8px; margin-bottom: 12px; }
          .product-content { display: flex; gap: 20px; margin-bottom: 15px; }
          .product-specs { flex: 1; }
          .product-specs li { margin: 5px 0; font-size: 12px; line-height: 1.5; }
          .product-image { flex: 0 0 260px; display: flex; align-items: flex-start; justify-content: center; padding-top: 10px; }
          .commercial-offer {
            background: #f8f9fa; border-left: 4px solid #d4a843;
            padding: 12px 15px; border-radius: 0 8px 8px 0;
          }
          .commercial-offer h3 { font-size: 13px; color: #1a1a2e; margin-bottom: 8px; }
          .commercial-offer p { margin: 4px 0; font-size: 12px; }
          .offer-note { font-size: 11px; color: #666; margin-top: 6px !important; }

          /* TOTALS PAGE */
          .totals-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .totals-table th { background: #1a1a2e; color: white; padding: 10px 12px; text-align: left; font-size: 11px; }
          .totals-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          .totals-summary { max-width: 350px; margin-left: auto; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #d4a843; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; }
          .totals-row.total { border-top: 2px solid #d4a843; font-weight: bold; font-size: 15px; color: #d4a843; padding-top: 8px; margin-top: 4px; }

          @media print {
            .header-fixed, .footer-fixed { position: fixed !important; }
          }
        </style>
      </head>
      <body>

        <!-- HEADER FIJO GLOBAL -->
        <div class="header-fixed">
          <div class="header-bar">
            <div class="header-title" id="headerTitle">PROPUESTA COMERCIAL</div>
            <div class="header-logo">
              <img src="${logoUrl}" style="height:80px;" onerror="this.style.display='none'">
            </div>
          </div>
          <div class="header-gradient"></div>
        </div>

        <!-- FOOTER FIJO GLOBAL -->
        <div class="footer-fixed">
          <div class="footer-gradient"></div>
          <div class="footer-content">
            <span>${companyName} SAS</span>
            <span class="footer-sep">●</span>
            <span>🌐 ${website}</span>
            <span class="footer-sep">●</span>
            <span>${companyAddress}</span>
            <span class="footer-sep">●</span>
            <span>${companyEmail}</span>
          </div>
        </div>

        <!-- PAGINA 1: PROPUESTA COMERCIAL -->
        <div class="page">
          <div class="page-body">
            <div class="date-line">Bogotá D.C., ${today}</div>

            <div class="customer-block">
              <p><strong>Señor(a):</strong></p>
              <p><strong>${quote.customer?.company || customerName}</strong></p>
              ${quote.customer?.company ? `<p>Aten. Sr(a). ${customerName}</p>` : ''}
              ${quote.customer?.phone ? `<p>${quote.customer.phone}</p>` : ''}
            </div>

            <div class="ref-line">Ref. ROYAL GAMING ROULETTES – PROPUESTA COMERCIAL</div>

            <div class="greeting">Estimado(a) ${firstName || 'Cliente'},</div>

            <div class="intro-text">
              Royal Gaming Roulettes llega al mercado colombiano con una propuesta innovadora: una ruleta
              con cilindro europeo patentado que aumenta la rentabilidad en un 38% o más, todo en una
              combinación de diseño, acústica y tecnología de las ruletas más avanzadas del mercado.
            </div>

            <div class="features-section">
              <h3>Principales Características</h3>
              <h4>Tecnología</h4>
              <ul>
                <li>Jackpot Novedoso de 4 Niveles.</li>
                <li>Bono Replique: (Desarrollo ÚNICO y EXCLUSIVO/I+D).</li>
                <li>Mecánica de Bonoscope: Ofrecer múltiples opciones de premio adicional a los jugadores que no han tenido una buena racha o cuyo saldo ha llegado a cero.</li>
                <li>Múltiples de apuesta, PREMIUM hasta 30dpi.</li>
                <li>Máxima seguridad en juego, incluye Luces led de colores en todo el contorno para una experiencia visual moderna.</li>
              </ul>
              <h4>Diseño de Vanguardia</h4>
              <ul>
                <li>Acabados de lujo, que combinan de gran manera la electrónica, video, metal y madera con el fin de crear una experiencia única.</li>
                <li>Imagen moderna, atractiva y amigable para los clientes.</li>
                <li>Iluminación externa configurable, que se puede guardar por casino a su gusto.</li>
                <li>Componentes internos de alta calidad tales como fuentes premium del mercado.</li>
              </ul>
            </div>

            ${quote.items && quote.items.length > 0 ? `
            <div class="featured-product">
              <div style="display:flex;gap:20px;align-items:flex-start;background:#f8f9fa;padding:15px;border-radius:8px;border-left:4px solid #d4a843;">
                <div style="flex:1;">
                  <h3 style="margin:0 0 8px 0;color:#1a1a2e;">ROYAL ${quote.items[0].product?.model || ''}</h3>
                  <p style="margin:3px 0;font-size:11px;">Superficie: ${quote.items[0].product?.diameterCm || '2150'}mm</p>
                  <p style="margin:3px 0;font-size:11px;">${quote.items[0].product?.positions || 6} estaciones de Juego</p>
                  <p style="margin:3px 0;font-size:11px;">8 computadores independientes.</p>
                  <p style="margin:3px 0;font-size:11px;">8 Billeteros de última generación.</p>
                  <p style="margin:3px 0;font-size:11px;">Monitores LCD de 24"</p>
                  <p style="margin:3px 0;font-size:11px;">Interfaz HD táctil de respuesta inmediata.</p>
                  <p style="margin:3px 0;font-size:11px;">2 cargadores para colgar, para una mejor experiencia y estabilidad de los clientes.</p>
                  <p style="margin:3px 0;font-size:11px;">Protocolo SAS de comunicaciones conforme a los nuevos requerimientos de Coljuegos.</p>
                  <p style="margin:3px 0;font-size:11px;">JACKPOT DE 4 NIVELES y MULTIPLICADORES DE APUESTA</p>
                </div>
                <div style="flex:0 0 220px;text-align:center;">
                  ${(() => {
                    const model = quote.items[0].product?.model || '';
                    const src = productImages[model] || quote.items[0].product?.imageUrl || '';
                    return src ? `<img src="${src}" style="max-width:100%;max-height:200px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">` : '';
                  })()}
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- PAGINAS 2+: FICHAS POR PRODUCTO -->
        ${productCardsHTML}

        <!-- PAGINA FINAL: RESUMEN DE TOTALES -->
        <div class="page">
          <div class="page-body">
            <div style="margin-bottom:15px;">
              <p><strong>Cliente:</strong> ${quote.customer?.fullName || 'N/A'}</p>
              ${quote.customer?.company ? `<p><strong>Empresa:</strong> ${quote.customer.company}</p>` : ''}
              <p><strong>Fecha:</strong> ${today}</p>
              <p><strong>Válida por:</strong> ${quote.validityDays || 30} días</p>
              <p><strong>Entrega:</strong> ${quote.deliveryTime || '60 días'}</p>
            </div>

            <table class="totals-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th style="text-align:right;">Precio Unit.</th>
                  <th style="text-align:right;">Descuento</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${(quote.items || []).map((item: any, i: number) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${item.product?.name || item.productId}</td>
                    <td style="text-align:center;">${item.quantity}</td>
                    <td style="text-align:right;">${formatCurrency(item.unitPrice)}</td>
                    <td style="text-align:center;">${item.discountPercent > 0 ? item.discountPercent + '%' : '-'}</td>
                    <td style="text-align:right;font-weight:bold;">${formatCurrency(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-summary">
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

            ${quote.notes ? `
            <div style="margin-top:25px;background:#f8f9fa;padding:12px;border-radius:8px;border-left:4px solid #d4a843;">
              <h4 style="margin:0 0 6px 0;color:#1a1a2e;">Notas</h4>
              <p style="margin:0;font-size:12px;color:#555;">${quote.notes}</p>
            </div>
            ` : ''}

            <div style="margin-top:30px;text-align:center;font-size:11px;color:#555;">
              <p>Agradecemos su preferencia y quedamos atentos a sus comentarios.</p>
              <p style="margin-top:15px;"><strong>${companyName} SAS</strong></p>
            </div>
          </div>
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
