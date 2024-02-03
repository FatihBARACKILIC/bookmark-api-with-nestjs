import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly service: BookmarkService) {}

  @Post()
  public async createBookmark(
    @GetUser('id') userId: number,
    @Body() bookmark: CreateBookmarkDto,
  ) {
    return await this.service.createBookmark(userId, bookmark);
  }

  @Get()
  public async getBookmarks(@GetUser('id') userId: number) {
    return await this.service.getBookmarks(userId);
  }

  @Get(':id')
  public async getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return await this.service.getBookmarkById(userId, bookmarkId);
  }

  @Patch(':id')
  public async editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() editBookmarkDto: EditBookmarkDto,
  ) {
    return await this.service.editBookmarkById(
      userId,
      bookmarkId,
      editBookmarkDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public async deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return await this.service.deleteBookmarkById(userId, bookmarkId);
  }
}
