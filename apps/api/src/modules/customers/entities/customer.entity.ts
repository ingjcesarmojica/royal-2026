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
import { User } from '../../users/entities/user.entity';
import { CustomerStatus } from '../../statuses/entities/customer-status.entity';
import { Interaction } from '../../interactions/entities/interaction.entity';
import { Message } from '../../messages/entities/message.entity';

export enum CustomerSource {
  CSV_IMPORT = 'csv_import',
  MANUAL = 'manual',
  WEB_FORM = 'web_form',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'enum', enum: CustomerSource, default: CustomerSource.MANUAL })
  source: CustomerSource;

  @Column({ name: 'status_id', nullable: true })
  statusId: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @ManyToOne(() => User, (user) => user.customers, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => CustomerStatus, (status) => status.customers, { nullable: true })
  @JoinColumn({ name: 'status_id' })
  status: CustomerStatus;

  @OneToMany(() => Interaction, (interaction) => interaction.customer)
  interactions: Interaction[];

  @OneToMany(() => Message, (message) => message.customer)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
