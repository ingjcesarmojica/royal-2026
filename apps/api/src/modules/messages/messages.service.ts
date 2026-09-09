import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageChannel, MessageStatus } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(dto: CreateMessageDto): Promise<Message> {
    const message = this.messagesRepository.create({
      ...dto,
      status: MessageStatus.PENDIENTE,
    });
    return this.messagesRepository.save(message);
  }

  async findByCustomer(customerId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { customerId },
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: MessageStatus): Promise<Message> {
    const message = await this.messagesRepository.findOne({ where: { id } });
    if (!message) throw new NotFoundException(`Message with ID ${id} not found`);
    message.status = status;
    return this.messagesRepository.save(message);
  }

  async getPendingJobs(): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { status: MessageStatus.PENDIENTE },
      order: { createdAt: 'ASC' },
    });
  }

  async getStats(): Promise<any> {
    const byChannel = await this.messagesRepository
      .createQueryBuilder('message')
      .select('message.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.channel')
      .getRawMany();

    const byStatus = await this.messagesRepository
      .createQueryBuilder('message')
      .select('message.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.status')
      .getRawMany();

    return { byChannel, byStatus };
  }
}
