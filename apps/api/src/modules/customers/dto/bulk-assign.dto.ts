import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkAssignDto {
  @ApiProperty({ required: false, nullable: true })
  @IsString()
  @IsOptional()
  fromOwnerId?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toOwnerId: string;
}
