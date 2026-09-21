import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, AuthProvider } from './modules/users/entities/user.entity';
import { Customer, CustomerSource } from './modules/customers/entities/customer.entity';
import { CustomerStatus } from './modules/statuses/entities/customer-status.entity';
import { CompanySettings } from './modules/config/entities/company-settings.entity';

async function runSeed(dataSource: DataSource) {
  try {
    const userRepo = dataSource.getRepository(User);
    const statusRepo = dataSource.getRepository(CustomerStatus);
    const settingsRepo = dataSource.getRepository(CompanySettings);

    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@royalcrm.com' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await userRepo.save(userRepo.create({
        fullName: 'Administrador',
        email: 'admin@royalcrm.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        authProvider: AuthProvider.PASSWORD,
      }));
      console.log('Admin user created: admin@royalcrm.com / admin123');
    }

    const statusCount = await statusRepo.count();
    if (statusCount === 0) {
      const statuses = [
        { name: 'Por contactar', order: 1, color: '#6b7280' },
        { name: 'Contactado', order: 2, color: '#3b82f6' },
        { name: 'En seguimiento', order: 3, color: '#8b5cf6' },
        { name: 'En negociación', order: 4, color: '#f59e0b' },
        { name: 'Ganado', order: 5, color: '#10b981' },
        { name: 'Perdido', order: 6, color: '#ef4444' },
      ];
      for (const s of statuses) {
        await statusRepo.save(statusRepo.create(s));
      }
      console.log('Default statuses created');
    }

    const existingSettings = await settingsRepo.findOne({ where: { id: 1 } });
    if (!existingSettings) {
      await settingsRepo.save(settingsRepo.create({
        id: 1,
        companyName: 'Royal CRM 2026',
        timezone: 'America/Bogota',
      }));
      console.log('Default company settings created');
    }

    // Seed test customers
    const customerRepo = dataSource.getRepository(Customer);
    const customerCount = await customerRepo.count();
    if (customerCount === 0) {
      const admin = await userRepo.findOne({ where: { email: 'admin@royalcrm.com' } });
      const statuses = await statusRepo.find({ order: { order: 'ASC' } });
      const statusMap: Record<string, number> = {};
      for (const s of statuses) statusMap[s.name] = s.id;

      const testCustomers = [
        {
          fullName: 'Carlos Mendoza',
          company: 'Mendoza Gaming S.A.S',
          email: 'carlos@mendozagaming.com',
          phone: '+57 310 234 5678',
          address: 'Calle 80 #15-30, Bogotá',
          source: CustomerSource.MANUAL,
          statusId: String(statusMap['Contactado'] || statuses[1]?.id),
          ownerId: admin?.id,
          notes: 'Interesado en 2 ruletas para su sala de billar',
        },
        {
          fullName: 'María Fernanda López',
          company: 'Royal Slots Colombia',
          email: 'maria@royalslots.co',
          phone: '+57 321 876 5432',
          address: 'Carrera 7 #45-12, Medellín',
          source: CustomerSource.WEB_FORM,
          statusId: String(statusMap['En negociación'] || statuses[3]?.id),
          ownerId: admin?.id,
          notes: 'Cotización enviada por 3 terminales. Esperando respuesta.',
        },
        {
          fullName: 'Andrés Felipe Restrepo',
          company: 'Apuestas del Valle',
          email: 'andres@apuestasvalle.com',
          phone: '+57 300 555 1234',
          address: 'Avenida 6N #34-56, Cali',
          source: CustomerSource.CSV_IMPORT,
          statusId: String(statusMap['Ganado'] || statuses[4]?.id),
          ownerId: admin?.id,
          notes: 'Cliente cerrado. Compra confirmada: 1 gabinete premium.',
        },
      ];

      for (const c of testCustomers) {
        await customerRepo.save(customerRepo.create(c));
      }
      console.log('3 test customers created');
    }

    console.log('Seed completed!');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://royalgaming-crm-web.onrender.com',
      'https://royal-2026-web.vercel.app',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Royal CRM 2026')
    .setDescription('API del sistema CRM Royal 2026')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;

  const dataSource = app.get(DataSource);
  await runSeed(dataSource);

  await app.listen(port);
  console.log(`Royal CRM API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
