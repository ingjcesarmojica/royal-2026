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
