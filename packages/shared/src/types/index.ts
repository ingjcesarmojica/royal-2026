export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VENDEDOR = 'vendedor',
  SOPORTE = 'soporte',
  LECTURA = 'lectura',
}

export enum CustomerSource {
  CSV_IMPORT = 'csv_import',
  MANUAL = 'manual',
  WEB_FORM = 'web_form',
}

export enum InteractionType {
  NOTA = 'nota',
  LLAMADA = 'llamada',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  VISITA = 'visita',
  ALARMA = 'alarma',
  RECORDATORIO = 'recordatorio',
  CAMBIO_ESTADO = 'cambio_estado',
}

export enum MessageChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export enum MessageDirection {
  OUT = 'out',
  IN = 'in',
}

export enum MessageStatus {
  PENDIENTE = 'pendiente',
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  LEIDO = 'leido',
  FALLIDO = 'fallido',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  fullName: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  source: CustomerSource;
  statusId?: string;
  ownerId?: string;
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerStatus {
  id: number;
  name: string;
  order: number;
  color: string;
}

export interface Interaction {
  id: string;
  customerId: string;
  userId: string;
  type: InteractionType;
  content?: string;
  scheduledAt?: Date;
  reminderAt?: Date;
  completed: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  customerId: string;
  channel: MessageChannel;
  direction: MessageDirection;
  templateId?: number;
  status: MessageStatus;
  payload?: Record<string, any>;
  createdAt: Date;
}

export interface MessageTemplate {
  id: number;
  channel: MessageChannel;
  name: string;
  subject?: string;
  body: string;
  variables?: string[];
}

export enum ProductCategory {
  RULETA = 'ruleta',
  TERMINAL = 'terminal',
  GABINETE = 'gabinete',
}

export interface Product {
  id: string;
  name: string;
  model: string;
  description?: string;
  category: ProductCategory;
  positions?: number;
  diameterCm?: number;
  basePrice: number;
  imageUrl?: string;
  features?: Record<string, any>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum QuoteStatus {
  BORRADOR = 'borrador',
  ENVIADA = 'enviada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  VENCIDA = 'vencida',
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  customerId: string;
  customer?: Customer;
  userId: string;
  user?: User;
  title: string;
  status: QuoteStatus;
  validityDays: number;
  deliveryTime?: string;
  notes?: string;
  discountPercent: number;
  subtotal: number;
  total: number;
  headerConfig?: {
    companyName?: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    nit?: string;
  };
  bannerConfig?: {
    enabled?: boolean;
    imageUrl?: string;
    text?: string;
    backgroundColor?: string;
  };
  footerConfig?: {
    logoUrl?: string;
    text?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
  };
  items?: QuoteItem[];
  createdAt: Date;
  updatedAt: Date;
}
