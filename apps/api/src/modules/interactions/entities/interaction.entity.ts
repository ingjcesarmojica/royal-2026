import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';

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

@Entity('interactions')
export class Interaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: InteractionType })
  type: InteractionType;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'reminder_at', type: 'timestamp', nullable: true })
  reminderAt: Date;

  @Column({ name: 'completed', default: false })
  completed: boolean;

  @ManyToOne(() => Customer, (customer) => customer.interactions)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.interactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
