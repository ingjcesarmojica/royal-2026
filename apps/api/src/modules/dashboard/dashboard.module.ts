import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Message } from '../messages/entities/message.entity';
import { Interaction } from '../interactions/entities/interaction.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Message, Interaction])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
