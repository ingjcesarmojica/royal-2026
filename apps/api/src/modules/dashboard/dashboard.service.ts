import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Message, MessageChannel } from '../messages/entities/message.entity';
import { Interaction } from '../interactions/entities/interaction.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Interaction)
    private interactionsRepository: Repository<Interaction>,
  ) {}

  async getStats() {
    const totalCustomers = await this.customersRepository.count();

    const customersByStatus = await this.customersRepository
      .createQueryBuilder('customer')
      .select('status.name', 'status')
      .addSelect('status.color', 'color')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('customer.status', 'status')
      .groupBy('status.name')
      .addGroupBy('status.color')
      .getRawMany();

    const customersByOwner = await this.customersRepository
      .createQueryBuilder('customer')
      .select('user.fullName', 'vendedor')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('customer.owner', 'user')
      .groupBy('user.fullName')
      .getRawMany();

    const messagesByChannel = await this.messagesRepository
      .createQueryBuilder('message')
      .select('message.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.channel')
      .getRawMany();

    const recentInteractions = await this.interactionsRepository
      .createQueryBuilder('interaction')
      .select(['interaction.type', 'interaction.content', 'interaction.createdAt'])
      .leftJoin('interaction.customer', 'customer')
      .leftJoin('interaction.user', 'user')
      .addSelect(['customer.fullName', 'user.fullName'])
      .orderBy('interaction.createdAt', 'DESC')
      .limit(10)
      .getMany();

    const conversionRate = await this.calculateConversionRate();

    return {
      totalCustomers,
      customersByStatus,
      customersByOwner,
      messagesByChannel,
      recentInteractions,
      conversionRate,
    };
  }

  private async calculateConversionRate(): Promise<number> {
    const total = await this.customersRepository.count();
    if (total === 0) return 0;

    const ganados = await this.customersRepository
      .createQueryBuilder('customer')
      .innerJoin('customer.status', 'status')
      .where('status.name = :name', { name: 'Ganado' })
      .getCount();

    return Math.round((ganados / total) * 100);
  }
}
