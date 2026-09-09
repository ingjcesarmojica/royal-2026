import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';

@Entity('customer_statuses')
export class CustomerStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: '#3b82f6' })
  color: string;

  @OneToMany(() => Customer, (customer) => customer.status)
  customers: Customer[];
}
