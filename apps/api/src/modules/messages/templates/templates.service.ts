import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageTemplate, TemplateChannel } from './entities/message-template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(MessageTemplate)
    private templatesRepository: Repository<MessageTemplate>,
  ) {}

  async create(dto: CreateTemplateDto): Promise<MessageTemplate> {
    const template = this.templatesRepository.create(dto);
    return this.templatesRepository.save(template);
  }

  async findAll(channel?: TemplateChannel): Promise<MessageTemplate[]> {
    const where = channel ? { channel } : {};
    return this.templatesRepository.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<MessageTemplate> {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Template with ID ${id} not found`);
    return template;
  }

  async update(id: number, dto: UpdateTemplateDto): Promise<MessageTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.templatesRepository.save(template);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    await this.templatesRepository.remove(template);
  }
}
