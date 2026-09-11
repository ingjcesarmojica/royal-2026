import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote, QuoteStatus } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
    @InjectRepository(QuoteItem)
    private quoteItemsRepository: Repository<QuoteItem>,
  ) {}

  async create(dto: CreateQuoteDto, userId: string): Promise<Quote> {
    const { items, ...quoteData } = dto;

    const quote = this.quotesRepository.create({
      ...quoteData,
      userId,
    });

    if (items && items.length > 0) {
      quote.items = items.map((item) => {
        const subtotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
        return this.quoteItemsRepository.create({
          ...item,
          subtotal,
        });
      });

      quote.subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
      quote.total = quote.subtotal * (1 - (quote.discountPercent || 0) / 100);
    }

    return this.quotesRepository.save(quote);
  }

  async findAll(filters?: { customerId?: string; status?: string; userId?: string }): Promise<Quote[]> {
    const where: any = {};

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    return this.quotesRepository.find({
      where,
      relations: ['customer', 'user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({
      where: { id },
      relations: ['customer', 'user', 'items', 'items.product'],
    });
    if (!quote) throw new NotFoundException(`Quote with ID ${id} not found`);
    return quote;
  }

  async update(id: string, dto: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.findOne(id);

    if (dto.items) {
      await this.quoteItemsRepository.delete({ quoteId: id });

      quote.items = dto.items.map((item) => {
        const subtotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
        return this.quoteItemsRepository.create({
          ...item,
          quoteId: id,
          subtotal,
        });
      });

      quote.subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
      quote.total = quote.subtotal * (1 - ((dto.discountPercent ?? quote.discountPercent) || 0) / 100);
    }

    if (dto.discountPercent !== undefined) {
      quote.discountPercent = dto.discountPercent;
      quote.total = quote.subtotal * (1 - dto.discountPercent / 100);
    }

    if (dto.title) quote.title = dto.title;
    if (dto.status) quote.status = dto.status as QuoteStatus;
    if (dto.deliveryTime) quote.deliveryTime = dto.deliveryTime;
    if (dto.notes !== undefined) quote.notes = dto.notes;
    if (dto.headerConfig) quote.headerConfig = dto.headerConfig;
    if (dto.bannerConfig) quote.bannerConfig = dto.bannerConfig;
    if (dto.footerConfig) quote.footerConfig = dto.footerConfig;

    return this.quotesRepository.save(quote);
  }

  async remove(id: string): Promise<void> {
    const quote = await this.findOne(id);
    await this.quotesRepository.remove(quote);
  }

  async getStats(): Promise<any> {
    const total = await this.quotesRepository.count();
    const byStatus = await this.quotesRepository
      .createQueryBuilder('quote')
      .select('quote.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('quote.status')
      .getRawMany();

    const totalValue = await this.quotesRepository
      .createQueryBuilder('quote')
      .select('SUM(quote.total)', 'total')
      .getRawOne();

    return { total, byStatus, totalValue: totalValue?.total || 0 };
  }
}
