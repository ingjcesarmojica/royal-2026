import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Customer } from '../modules/customers/entities/customer.entity';
import { CustomerStatus } from '../modules/statuses/entities/customer-status.entity';
import { Interaction } from '../modules/interactions/entities/interaction.entity';
import { Message } from '../modules/messages/entities/message.entity';
import { MessageTemplate } from '../modules/messages/templates/entities/message-template.entity';
import { ImportJob } from '../modules/import/entities/import-job.entity';
import { CompanySettings } from '../modules/config/entities/company-settings.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Quote } from '../modules/quotes/entities/quote.entity';
import { QuoteItem } from '../modules/quotes/entities/quote-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Customer,
      CustomerStatus,
      Interaction,
      Message,
      MessageTemplate,
      ImportJob,
      CompanySettings,
      AuditLog,
      Product,
      Quote,
      QuoteItem,
    ]),
  ],
})
export class DatabaseModule {}
