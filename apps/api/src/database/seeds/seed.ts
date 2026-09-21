import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, AuthProvider } from '../../modules/users/entities/user.entity';
import { Customer, CustomerSource } from '../../modules/customers/entities/customer.entity';
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

  // Seed test customers
  const customerCount = await dataSource.getRepository(Customer).count();
  if (customerCount === 0) {
    const customerRepo = dataSource.getRepository(Customer);
    const admin = await userRepository.findOne({ where: { email: 'admin@royalcrm.com' } });
    const statuses = await statusRepository.find({ order: { order: 'ASC' } });
    const statusMap: Record<string, number> = {};
    for (const s of statuses) statusMap[s.name] = s.id;

    const testCustomers = [
      {
        fullName: 'Carlos Mendoza',
        company: 'Mendoza Gaming S.A.S',
        email: 'carlos@mendozagaming.com',
        phone: '+57 310 234 5678',
        address: 'Carrera 15 #82-35, Chapinero, Bogotá',
        source: CustomerSource.MANUAL,
        statusId: String(statusMap['Contactado'] || statuses[1]?.id),
        ownerId: admin?.id,
        notes: 'Interesado en 2 ruletas para su sala de billar en Chapinero',
      },
      {
        fullName: 'María Fernanda López',
        company: 'Royal Slots Colombia',
        email: 'maria@royalslots.co',
        phone: '+57 321 876 5432',
        address: 'Calle 72 #10-20, Barrio España, Bogotá',
        source: CustomerSource.WEB_FORM,
        statusId: String(statusMap['En negociación'] || statuses[3]?.id),
        ownerId: admin?.id,
        notes: 'Cotización enviada por 3 terminales. Sede en Barrio España.',
      },
      {
        fullName: 'Andrés Felipe Restrepo',
        company: 'Apuestas del Valle',
        email: 'andres@apuestasvalle.com',
        phone: '+57 300 555 1234',
        address: 'Avenida Caracas #48-15, Santa Fe, Bogotá',
        source: CustomerSource.CSV_IMPORT,
        statusId: String(statusMap['Ganado'] || statuses[4]?.id),
        ownerId: admin?.id,
        notes: 'Cliente cerrado. Compra confirmada: 1 gabinete premium.',
      },
    ];

    for (const c of testCustomers) {
      await customerRepo.save(customerRepo.create(c));
    }
    console.log('✅ 3 test customers created');
  }

  console.log('🎉 Seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
