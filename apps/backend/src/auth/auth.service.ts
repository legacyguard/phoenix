import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { UserSettingsService } from '../user-settings/user-settings.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userSettingsService: UserSettingsService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<{ user: { id: string; email: string }; accessToken: string }> {
    const { email, password } = registerUserDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    // Initialize default user settings
    await this.userSettingsService.createDefaultSettings(user.id);

    return this.generateTokens(user.id, user.email);
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.generateTokens(user.id, user.email);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: userId,
        email: email,
      },
      accessToken,
    };
  }
}
