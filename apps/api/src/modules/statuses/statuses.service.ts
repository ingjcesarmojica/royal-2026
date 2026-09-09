import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerStatus } from './entities/customer-status.entity';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(CustomerStatus)
    private statusesRepository: Repository<CustomerStatus>,
  ) {}

  async create(dto: CreateStatusDto): Promise<CustomerStatus> {
    const maxOrder = await this.statusesRepository
      .createQueryBuilder('status')
      .select('MAX(status.order)', 'max')
      .getRawOne();

    const status = this.statusesRepository.create({
      ...dto,
      order: dto.order ?? (maxOrder?.max ?? 0) + 1,
    });
    return this.statusesRepository.save(status);
  }

  async findAll(): Promise<CustomerStatus[]> {
    return this.statusesRepository.find({ order: { order: 'ASC' } });
  }

  async findOne(id: number): Promise<CustomerStatus> {
    const status = await this.statusesRepository.findOne({ where: { id } });
    if (!status) throw new NotFoundException(`Status with ID ${id} not found`);
    return status;
  }

  async update(id: number, dto: UpdateStatusDto): Promise<CustomerStatus> {
    const status = await this.findOne(id);
    Object.assign(status, dto);
    return this.statusesRepository.save(status);
  }

  async remove(id: number): Promise<void> {
    const status = await this.findOne(id);
    await this.statusesRepository.remove(status);
  }

  async reorder(statuses: { id: number; order: number }[]): Promise<CustomerStatus[]> {
    for (const item of statuses) {
      await this.statusesRepository.update(item.id, { order: item.order });
    }
    return this.findAll();
  }
}
