import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User, AuthProvider } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
      authProvider: AuthProvider.PASSWORD,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async validateGoogleUser(profile: any) {
    const { email, displayName, id } = profile;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        fullName: displayName,
        email,
        authProvider: AuthProvider.GOOGLE,
        authProviderId: id,
      });
    }

    return this.generateTokens(user);
  }

  async validateMicrosoftUser(profile: any) {
    const { emails, displayName, id } = profile;
    const email = emails?.[0]?.value;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        fullName: displayName,
        email,
        authProvider: AuthProvider.MICROSOFT,
        authProviderId: id,
      });
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
