import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserStatus } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('EMAIL_EXISTS');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
      phone: dto.phone,
      department: dto.department,
    });
    await this.usersRepo.save(user);

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('INVALID_CREDENTIALS');

    if (user.status !== UserStatus.ACTIVE) throw new ForbiddenException('ACCOUNT_INACTIVE');

    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.status !== UserStatus.ACTIVE) throw new ForbiddenException('ACCOUNT_INACTIVE');

    const { passwordHash: _, ...result } = user;
    return result;
  }
}
