import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectRepository(CompanySettings)
    private settingsRepository: Repository<CompanySettings>,
  ) {}

  async getSettings(): Promise<CompanySettings> {
    let settings = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepository.create({ id: 1 });
      await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<CompanySettings> {
    const settings = await this.getSettings();
    Object.assign(settings, dto);
    return this.settingsRepository.save(settings);
  }
}
