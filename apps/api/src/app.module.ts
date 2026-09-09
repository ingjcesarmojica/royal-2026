import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { StatusesModule } from './modules/statuses/statuses.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ImportModule } from './modules/import/import.module';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'royal_crm_user'),
        password: config.get('DB_PASSWORD', 'royal_crm_dev_password'),
        database: config.get('DB_DATABASE', 'royal_crm'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') !== 'production',
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    StatusesModule,
    InteractionsModule,
    MessagesModule,
    ImportModule,
    AppConfigModule,
    DashboardModule,
    AuditModule,
  ],
})
export class AppModule {}
