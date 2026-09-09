import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, AuthProvider } from '../../modules/users/entities/user.entity';
import { Customer } from '../../modules/customers/entities/customer.entity';
import { CustomerStatus } from '../../modules/statuses/entities/customer-status.entity';
import { Interaction } from '../../modules/interactions/entities/interaction.entity';
import { Message } from '../../modules/messages/entities/message.entity';
import { MessageTemplate } from '../../modules/messages/templates/entities/message-template.entity';
import { ImportJob } from '../../modules/import/entities/import-job.entity';
import { CompanySettings } from '../../modules/config/entities/company-settings.entity';
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'royal_crm_user',
    password: process.env.DB_PASSWORD || 'royal_crm_dev_password',
    database: process.env.DB_DATABASE || 'royal_crm',
    entities: [User, Customer, CustomerStatus, Interaction, Message, MessageTemplate, ImportJob, CompanySettings, AuditLog],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const userRepository = dataSource.getRepository(User);
  const statusRepository = dataSource.getRepository(CustomerStatus);
  const settingsRepository = dataSource.getRepository(CompanySettings);

  // Create default admin user
  const existingAdmin = await userRepository.findOne({ where: { email: 'admin@royalcrm.com' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await userRepository.save(
      userRepository.create({
        fullName: 'Administrador',
        email: 'admin@royalcrm.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        authProvider: AuthProvider.PASSWORD,
      }),
    );
    console.log('✅ Admin user created: admin@royalcrm.com / admin123');
  }

  // Create default statuses
  const existingStatuses = await statusRepository.count();
  if (existingStatuses === 0) {
    const defaultStatuses = [
      { name: 'Por contactar', order: 1, color: '#6b7280' },
      { name: 'Contactado', order: 2, color: '#3b82f6' },
      { name: 'En seguimiento', order: 3, color: '#8b5cf6' },
      { name: 'En negociación', order: 4, color: '#f59e0b' },
      { name: 'Ganado', order: 5, color: '#10b981' },
      { name: 'Perdido', order: 6, color: '#ef4444' },
    ];

    for (const status of defaultStatuses) {
      await statusRepository.save(statusRepository.create(status));
    }
    console.log('✅ Default statuses created');
  }

  // Create default company settings
  const existingSettings = await settingsRepository.findOne({ where: { id: 1 } });
  if (!existingSettings) {
    await settingsRepository.save(
      settingsRepository.create({
        id: 1,
        companyName: 'Royal CRM 2026',
        timezone: 'America/Bogota',
      }),
    );
    console.log('✅ Default company settings created');
  }

  console.log('🎉 Seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
