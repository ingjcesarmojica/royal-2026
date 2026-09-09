import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { AppConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanySettings])],
  controllers: [ConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
