import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { MessageTemplate } from '../templates/entities/message-template.entity';

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

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ type: 'enum', enum: MessageChannel })
  channel: MessageChannel;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @Column({ name: 'template_id', nullable: true })
  templateId: number;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.PENDIENTE })
  status: MessageStatus;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @ManyToOne(() => Customer, (customer) => customer.messages)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => MessageTemplate, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: MessageTemplate;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
