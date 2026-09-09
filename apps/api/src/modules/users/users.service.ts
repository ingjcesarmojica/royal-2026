import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly MAX_ACTIVE_USERS = 5;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const activeCount = await this.usersRepository.count({ where: { active: true } });
    if (activeCount >= this.MAX_ACTIVE_USERS) {
      throw new BadRequestException(`Maximum of ${this.MAX_ACTIVE_USERS} active users reached`);
    }

    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.active = false;
    return this.usersRepository.save(user);
  }
}
