import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Message } from '../messages/entities/message.entity';
import { Interaction } from '../interactions/entities/interaction.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Message, Interaction, Quote, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
