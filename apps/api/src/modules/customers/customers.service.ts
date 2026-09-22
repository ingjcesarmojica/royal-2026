import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(dto);
    return this.customersRepository.save(customer);
  }

  async findAll(filters?: { search?: string; statusId?: string; ownerId?: string }): Promise<Customer[]> {
    const where: any = {};

    if (filters?.statusId) {
      where.statusId = filters.statusId;
    }

    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters?.search) {
      where.fullName = Like(`%${filters.search}%`);
    }

    return this.customersRepository.find({
      where,
      relations: ['owner', 'status'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: ['owner', 'status', 'interactions', 'messages'],
    });
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customersRepository.save(customer);
  }

  async updateStatus(id: string, statusId: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.statusId = statusId;
    return this.customersRepository.save(customer);
  }

  async assignOwner(id: string, ownerId: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.ownerId = ownerId;
    return this.customersRepository.save(customer);
  }

  async bulkReassign(fromOwnerId: string | null, toOwnerId: string): Promise<{ affected: number }> {
    const qb = this.customersRepository
      .createQueryBuilder()
      .update(Customer)
      .set({ ownerId: toOwnerId });

    if (fromOwnerId) {
      qb.where('owner_id = :fromOwnerId', { fromOwnerId });
    } else {
      qb.where('owner_id IS NULL');
    }

    const result = await qb.execute();
    return { affected: result.affected || 0 };
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }

  async getStats(ownerId?: string): Promise<any> {
    const where = ownerId ? { ownerId } : {};
    const total = await this.customersRepository.count({ where });
    const byStatus = await this.customersRepository
      .createQueryBuilder('customer')
      .select('customer.status_id', 'statusId')
      .addSelect('COUNT(*)', 'count')
      .where(ownerId ? 'customer.owner_id = :ownerId' : '1=1', { ownerId })
      .groupBy('customer.status_id')
      .getRawMany();

    return { total, byStatus };
  }

  async getStatsByOwner(): Promise<any[]> {
    return this.customersRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.owner', 'owner')
      .select('owner.id', 'ownerId')
      .addSelect('owner.full_name', 'ownerName')
      .addSelect('COUNT(customer.id)', 'count')
      .groupBy('owner.id')
      .addGroupBy('owner.full_name')
      .getRawMany();
  }
}
