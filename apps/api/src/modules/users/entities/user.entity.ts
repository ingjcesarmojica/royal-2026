import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Interaction } from '../../interactions/entities/interaction.entity';
import { ImportJob } from '../../import/entities/import-job.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VENDEDOR = 'vendedor',
  SOPORTE = 'soporte',
  LECTURA = 'lectura',
}

export enum AuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  PASSWORD = 'password',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VENDEDOR })
  role: UserRole;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.PASSWORD })
  authProvider: AuthProvider;

  @Column({ name: 'auth_provider_id', nullable: true })
  authProviderId: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Customer, (customer) => customer.owner)
  customers: Customer[];

  @OneToMany(() => Interaction, (interaction) => interaction.user)
  interactions: Interaction[];

  @OneToMany(() => ImportJob, (importJob) => importJob.user)
  importJobs: ImportJob[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
