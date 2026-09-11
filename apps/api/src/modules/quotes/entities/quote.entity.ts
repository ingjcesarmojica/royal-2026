import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { QuoteItem } from './quote-item.entity';

export enum QuoteStatus {
  BORRADOR = 'borrador',
  ENVIADA = 'enviada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  VENCIDA = 'vencida',
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.BORRADOR })
  status: QuoteStatus;

  @Column({ name: 'validity_days', default: 30 })
  validityDays: number;

  @Column({ name: 'delivery_time', nullable: true })
  deliveryTime: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'header_config', type: 'jsonb', nullable: true })
  headerConfig: {
    companyName?: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    nit?: string;
  };

  @Column({ name: 'banner_config', type: 'jsonb', nullable: true })
  bannerConfig: {
    enabled?: boolean;
    imageUrl?: string;
    text?: string;
    backgroundColor?: string;
  };

  @Column({ name: 'footer_config', type: 'jsonb', nullable: true })
  footerConfig: {
    logoUrl?: string;
    text?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
  };

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => QuoteItem, (item) => item.quote, { cascade: true, eager: true })
  items: QuoteItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
