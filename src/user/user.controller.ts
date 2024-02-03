import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('me')
  public async getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  public async editUser(@GetUser('id') userId: number, @Body() user: EditDto) {
    return await this.service.editUser(userId, user);
  }
}
