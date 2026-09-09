import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    oldValues?: any,
    newValues?: any,
  ): Promise<AuditLog> {
    const log = this.auditRepository.create({
      userId,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
    });
    return this.auditRepository.save(log);
  }

  async findAll(filters?: { entity?: string; userId?: string }): Promise<AuditLog[]> {
    const where: any = {};
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.userId) where.userId = filters.userId;

    return this.auditRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
