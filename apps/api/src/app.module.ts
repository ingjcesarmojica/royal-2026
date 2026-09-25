import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
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
import { ProductsModule } from './modules/products/products.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { DatabaseModule } from './database/database.module';
import { RolesGuard } from './common/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        const useSsl =
          config.get<string>(
            'DB_SSL',
            process.env.NODE_ENV === 'production' ? 'true' : 'false',
          ) === 'true';

        return {
          type: 'postgres' as const,
          ...(url
            ? { url }
            : {
                host: config.get<string>('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get<string>('DB_USERNAME', 'royal_crm_user'),
                password: config.get<string>('DB_PASSWORD', 'royal_crm_dev_password'),
                database: config.get<string>('DB_DATABASE', 'royal_crm'),
              }),
          ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
        };
      },
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
    ProductsModule,
    QuotesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
