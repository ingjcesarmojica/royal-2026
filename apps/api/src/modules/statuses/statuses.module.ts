import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerStatus } from './entities/customer-status.entity';
import { StatusesService } from './statuses.service';
import { StatusesController } from './statuses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerStatus])],
  controllers: [StatusesController],
  providers: [StatusesService],
  exports: [StatusesService],
})
export class StatusesModule {}
