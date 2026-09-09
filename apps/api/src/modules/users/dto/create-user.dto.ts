import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, AuthProvider } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.VENDEDOR })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ enum: AuthProvider, default: AuthProvider.PASSWORD })
  @IsEnum(AuthProvider)
  @IsOptional()
  authProvider?: AuthProvider;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  authProviderId?: string;
}
