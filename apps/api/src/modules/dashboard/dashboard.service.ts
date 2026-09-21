import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, MoreThan } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Message } from '../messages/entities/message.entity';
import { Interaction } from '../interactions/entities/interaction.entity';
import { Quote, QuoteStatus } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';

export type DashboardRange = 'today' | '7d' | '30d' | 'previous_month' | 'all';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Interaction)
    private interactionsRepository: Repository<Interaction>,
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getStats(userId?: string, userRole?: string, range?: DashboardRange) {
    const isVendedor = userRole === 'vendedor';
    const ownerId = isVendedor ? userId : undefined;

    const dateFilter = this.getDateFilter(range);

    const [
      totalCustomers,
      customersByStatus,
      customersByOwner,
      messagesByChannel,
      recentInteractions,
      conversionRate,
      pipelineValue,
      averageTicket,
      averageCloseTimeDays,
      alerts,
      teamRatings,
    ] = await Promise.all([
      this.countCustomers(ownerId, dateFilter),
      this.getCustomersByStatus(ownerId, dateFilter),
      isVendedor ? Promise.resolve([]) : this.getCustomersByOwner(dateFilter),
      this.getMessagesByChannel(dateFilter),
      this.getRecentInteractions(ownerId),
      this.calculateConversionRate(ownerId),
      this.calculatePipelineValue(ownerId),
      this.calculateAverageTicket(ownerId),
      this.calculateAverageCloseTimeDays(ownerId),
      this.getAlerts(ownerId),
      isVendedor ? Promise.resolve([]) : this.getTeamRatings(),
    ]);

    return {
      totalCustomers,
      customersByStatus,
      customersByOwner,
      messagesByChannel,
      recentInteractions,
      conversionRate,
      pipelineValue,
      averageTicket,
      averageCloseTimeDays,
      alerts,
      teamRatings,
    };
  }

  private getDateFilter(range?: DashboardRange): { start?: Date; end?: Date } | undefined {
    if (!range || range === 'all') return undefined;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case 'today':
        return { start: startOfDay, end: now };
      case '7d': {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        return { start, end: now };
      }
      case '30d': {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        return { start, end: now };
      }
      case 'previous_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return { start, end };
      }
      default:
        return undefined;
    }
  }

  private async countCustomers(ownerId?: string, dateFilter?: { start?: Date; end?: Date }): Promise<number> {
    const qb = this.customersRepository.createQueryBuilder('customer');

    if (ownerId) {
      qb.where('customer.owner_id = :ownerId', { ownerId });
    }

    if (dateFilter?.start) {
      qb.andWhere('customer.created_at >= :start', { start: dateFilter.start });
    }
    if (dateFilter?.end) {
      qb.andWhere('customer.created_at <= :end', { end: dateFilter.end });
    }

    return qb.getCount();
  }

  private async getCustomersByStatus(ownerId?: string, dateFilter?: { start?: Date; end?: Date }) {
    const qb = this.customersRepository
      .createQueryBuilder('customer')
      .select('status.name', 'status')
      .addSelect('status.color', 'color')
      .addSelect('status.id', 'statusId')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('customer.status', 'status');

    if (ownerId) {
      qb.where('customer.owner_id = :ownerId', { ownerId });
    }

    if (dateFilter?.start) {
      qb.andWhere('customer.created_at >= :start', { start: dateFilter.start });
    }
    if (dateFilter?.end) {
      qb.andWhere('customer.created_at <= :end', { end: dateFilter.end });
    }

    return qb.groupBy('status.name').addGroupBy('status.color').addGroupBy('status.id').getRawMany();
  }

  private async getCustomersByOwner(dateFilter?: { start?: Date; end?: Date }) {
    const qb = this.customersRepository
      .createQueryBuilder('customer')
      .select('user.fullName', 'vendedor')
      .addSelect('user.id', 'userId')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('customer.owner', 'user');

    if (dateFilter?.start) {
      qb.where('customer.created_at >= :start', { start: dateFilter.start });
    }
    if (dateFilter?.end) {
      qb.andWhere('customer.created_at <= :end', { end: dateFilter.end });
    }

    return qb.groupBy('user.fullName').addGroupBy('user.id').orderBy('COUNT(*)', 'DESC').getRawMany();
  }

  private async getMessagesByChannel(dateFilter?: { start?: Date; end?: Date }) {
    const qb = this.messagesRepository
      .createQueryBuilder('message')
      .select('message.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.channel');

    if (dateFilter?.start) {
      qb.where('message.created_at >= :start', { start: dateFilter.start });
    }
    if (dateFilter?.end) {
      qb.andWhere('message.created_at <= :end', { end: dateFilter.end });
    }

    return qb.getRawMany();
  }

  private async getRecentInteractions(ownerId?: string) {
    const qb = this.interactionsRepository
      .createQueryBuilder('interaction')
      .select(['interaction.type', 'interaction.content', 'interaction.createdAt'])
      .leftJoin('interaction.customer', 'customer')
      .leftJoin('interaction.user', 'user')
      .addSelect(['customer.fullName', 'customer.id', 'user.fullName']);

    if (ownerId) {
      qb.where('customer.owner_id = :ownerId', { ownerId });
    }

    return qb.orderBy('interaction.createdAt', 'DESC').limit(10).getMany();
  }

  private async calculateConversionRate(ownerId?: string): Promise<number> {
    const countQb = this.customersRepository.createQueryBuilder('customer');

    if (ownerId) {
      countQb.where('customer.owner_id = :ownerId', { ownerId });
    }

    const total = await countQb.getCount();
    if (total === 0) return 0;

    const ganadosQb = this.customersRepository
      .createQueryBuilder('customer')
      .innerJoin('customer.status', 'status')
      .where('status.name = :name', { name: 'Ganado' });

    if (ownerId) {
      ganadosQb.andWhere('customer.owner_id = :ownerId', { ownerId });
    }

    const ganados = await ganadosQb.getCount();
    return Math.round((ganados / total) * 100);
  }

  private async calculatePipelineValue(ownerId?: string): Promise<number> {
    const statuses: QuoteStatus[] = [QuoteStatus.BORRADOR, QuoteStatus.ENVIADA];

    const qb = this.quotesRepository
      .createQueryBuilder('quote')
      .select('COALESCE(SUM(quote.total), 0)', 'total')
      .where('quote.status IN (:...statuses)', { statuses });

    if (ownerId) {
      qb.andWhere('quote.user_id = :ownerId', { ownerId });
    }

    const result = await qb.getRawOne();
    return parseFloat(result?.total) || 0;
  }

  private async calculateAverageTicket(ownerId?: string): Promise<number> {
    const qb = this.quotesRepository
      .createQueryBuilder('quote')
      .select('COALESCE(AVG(quote.total), 0)', 'avg')
      .where('quote.status = :status', { status: QuoteStatus.APROBADA });

    if (ownerId) {
      qb.andWhere('quote.user_id = :ownerId', { ownerId });
    }

    const result = await qb.getRawOne();
    return Math.round(parseFloat(result?.avg) || 0);
  }

  private async calculateAverageCloseTimeDays(ownerId?: string): Promise<number> {
    const qb = this.interactionsRepository
      .createQueryBuilder('interaction')
      .select('AVG(DAYS_DIFF)', 'avgDays')
      .from((subQb) => {
        const sub = subQb
          .select('customer.id', 'customerId')
          .addSelect(
            `EXTRACT(EPOCH FROM (
              (SELECT MAX(i2.created_at) FROM interactions i2 WHERE i2.customer_id = customer.id) -
              customer.created_at
            )) / 86400`,
            'days_diff',
          )
          .from(Customer, 'customer')
          .innerJoin('customer.status', 'status')
          .where('status.name = :statusName', { statusName: 'Ganado' });

        if (ownerId) {
          sub.andWhere('customer.owner_id = :ownerId', { ownerId });
        }

        return sub;
      }, 'subquery')
      .addSelect('AVG(subquery.days_diff)', 'avgDays');

    const result = await qb.getRawOne();
    return Math.round(parseFloat(result?.avgDays) || 0);
  }

  private async getAlerts(ownerId?: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [sinSeguimiento, cotizacionesPorVencer, leadsSinContactar] = await Promise.all([
      this.countCustomersWithoutFollowup(sevenDaysAgo, ownerId),
      this.countExpiringQuotes(weekFromNow, ownerId),
      this.countColdLeads(twentyFourHoursAgo, ownerId),
    ]);

    return { sinSeguimiento, cotizacionesPorVencer, leadsSinContactar };
  }

  private async countCustomersWithoutFollowup(since: Date, ownerId?: string): Promise<number> {
    const qb = this.customersRepository
      .createQueryBuilder('customer')
      .innerJoin('customer.status', 'status')
      .where('status.name != :ganado', { ganado: 'Ganado' })
      .andWhere('status.name != :perdido', { perdido: 'Perdido' })
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM interactions i
          WHERE i.customer_id = customer.id
          AND i.created_at > :since
        )`,
        { since },
      );

    if (ownerId) {
      qb.andWhere('customer.owner_id = :ownerId', { ownerId });
    }

    return qb.getCount();
  }

  private async countExpiringQuotes(before: Date, ownerId?: string): Promise<number> {
    const qb = this.quotesRepository
      .createQueryBuilder('quote')
      .where('quote.status IN (:...statuses)', {
        statuses: [QuoteStatus.BORRADOR, QuoteStatus.ENVIADA],
      })
      .andWhere(
        `(quote.created_at + (quote.validity_days || ' days')::interval) <= :before`,
        { before },
      )
      .andWhere(
        `(quote.created_at + (quote.validity_days || ' days')::interval) >= :now`,
        { now: new Date() },
      );

    if (ownerId) {
      qb.andWhere('quote.user_id = :ownerId', { ownerId });
    }

    return qb.getCount();
  }

  private async countColdLeads(since: Date, ownerId?: string): Promise<number> {
    const qb = this.customersRepository
      .createQueryBuilder('customer')
      .innerJoin('customer.status', 'status')
      .where('status.name = :statusName', { statusName: 'Por contactar' })
      .andWhere('customer.created_at <= :since', { since });

    if (ownerId) {
      qb.andWhere('customer.owner_id = :ownerId', { ownerId });
    }

    return qb.getCount();
  }

  async getTeamRatings() {
    const owners = await this.customersRepository
      .createQueryBuilder('customer')
      .select('user.id', 'userId')
      .addSelect('user.fullName', 'fullName')
      .leftJoin('customer.owner', 'user')
      .where('user.id IS NOT NULL')
      .groupBy('user.id')
      .addGroupBy('user.fullName')
      .getRawMany();

    const ratings = await Promise.all(
      owners.map(async (owner) => {
        const totalCustomers = await this.customersRepository
          .createQueryBuilder('customer')
          .where('customer.owner_id = :ownerId', { ownerId: owner.userId })
          .getCount();

        if (totalCustomers === 0) {
          return { userId: owner.userId, fullName: owner.fullName, stars: 0, metrics: { customers: 0, conversion: 0, activities: 0, pipeline: 0 } };
        }

        const ganados = await this.customersRepository
          .createQueryBuilder('customer')
          .innerJoin('customer.status', 'status')
          .where('customer.owner_id = :ownerId', { ownerId: owner.userId })
          .andWhere('status.name = :name', { name: 'Ganado' })
          .getCount();

        const conversion = Math.round((ganados / totalCustomers) * 100);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activities = await this.interactionsRepository
          .createQueryBuilder('interaction')
          .innerJoin('interaction.customer', 'customer')
          .where('customer.owner_id = :ownerId', { ownerId: owner.userId })
          .andWhere('interaction.created_at >= :since', { since: thirtyDaysAgo })
          .getCount();

        const pipelineResult = await this.quotesRepository
          .createQueryBuilder('quote')
          .select('COALESCE(SUM(quote.total), 0)', 'total')
          .where('quote.user_id = :ownerId', { ownerId: owner.userId })
          .andWhere('quote.status IN (:...statuses)', {
            statuses: [QuoteStatus.BORRADOR, QuoteStatus.ENVIADA, QuoteStatus.APROBADA],
          })
          .getRawOne();

        const pipelineValue = parseFloat(pipelineResult?.total) || 0;

        const customerScore = Math.min(totalCustomers / 10, 1) * 25;
        const conversionScore = (conversion / 100) * 30;
        const activityScore = Math.min(activities / 20, 1) * 25;
        const maxPipeline = 50000000;
        const pipelineScore = Math.min(pipelineValue / maxPipeline, 1) * 20;

        const totalScore = customerScore + conversionScore + activityScore + pipelineScore;
        const stars = totalScore >= 80 ? 5 : totalScore >= 60 ? 4 : totalScore >= 40 ? 3 : totalScore >= 20 ? 2 : totalScore > 0 ? 1 : 0;

        return {
          userId: owner.userId,
          fullName: owner.fullName,
          stars,
          metrics: {
            customers: totalCustomers,
            conversion,
            activities,
            pipelineValue,
          },
        };
      }),
    );

    return ratings.sort((a, b) => b.stars - a.stars);
  }
}
