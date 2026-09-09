import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company_settings')
export class CompanySettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_name', default: 'Royal CRM' })
  companyName: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'whatsapp_config', type: 'jsonb', nullable: true })
  whatsappConfig: Record<string, any>;

  @Column({ name: 'email_config', type: 'jsonb', nullable: true })
  emailConfig: Record<string, any>;

  @Column({ default: 'America/Bogota' })
  timezone: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
