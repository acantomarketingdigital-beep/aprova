import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    const { password_hash: _, ...result } = user;
    return result as Omit<User, 'password_hash'>;
  }

  async login(user: Omit<User, 'password_hash'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const payload = { email: user.email, sub: user.id, role: user.role };
    const { password_hash: _, ...safeUser } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }
}
