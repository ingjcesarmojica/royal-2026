import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportJob } from './entities/import-job.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportJob, Customer]),
    CustomersModule,
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
