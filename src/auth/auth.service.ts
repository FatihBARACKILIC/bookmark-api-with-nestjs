import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async signin(dto: AuthDto): Promise<{ [key: string]: unknown }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new ForbiddenException('Credentials incorrect');
      }

      const pwMatches = await argon2.verify(user.password, dto.password);

      if (!pwMatches) {
        throw new ForbiddenException('Credentials incorrect');
      }
      return await this.signToken(user.id, user.email);
    } catch (error) {
      throw error;
    }
  }

  public async signup(dto: AuthDto): Promise<{ [key: string]: unknown }> {
    try {
      const hash = await argon2.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: hash,
        },
      });
      return await this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            `[${error?.meta?.target}] credentials taken`,
          );
        }
      }
      throw error;
    }
  }

  private async signToken(
    userId: number,
    email: string,
  ): Promise<{ [key: string]: unknown }> {
    const payload = { sub: userId, email };
    const secret = this.config.get<string>('jwtSecret');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return { access_token: token };
  }
}
