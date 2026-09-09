import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interaction, InteractionType } from './entities/interaction.entity';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private interactionsRepository: Repository<Interaction>,
  ) {}

  async create(dto: CreateInteractionDto): Promise<Interaction> {
    const interaction = this.interactionsRepository.create(dto);
    return this.interactionsRepository.save(interaction);
  }

  async findByCustomer(customerId: string): Promise<Interaction[]> {
    return this.interactionsRepository.find({
      where: { customerId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async recordStatusChange(
    customerId: string,
    userId: string,
    oldStatusId: string,
    newStatusId: string,
  ): Promise<Interaction> {
    return this.create({
      customerId,
      userId,
      type: InteractionType.CAMBIO_ESTADO,
      content: `Estado cambiado de ${oldStatusId} a ${newStatusId}`,
    });
  }

  async remove(id: string): Promise<void> {
    const interaction = await this.interactionsRepository.findOne({ where: { id } });
    if (!interaction) throw new NotFoundException(`Interaction with ID ${id} not found`);
    await this.interactionsRepository.remove(interaction);
  }
}
