import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  public async editUser(userId: number, user: EditDto) {
    const newUser = await this.prisma.user.update({
      where: { id: userId },
      data: { ...user },
    });

    delete (newUser as any).password;

    return newUser;
  }
}
