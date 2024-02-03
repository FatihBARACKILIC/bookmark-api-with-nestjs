import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  public async createBookmark(
    userId: number,
    createBookmarkDto: CreateBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        ...createBookmarkDto,
        userId,
      },
    });

    return bookmark;
  }

  public async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({ where: { userId } });
  }

  public async getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findUnique({
      where: { userId, id: bookmarkId },
    });
  }

  public async editBookmarkById(
    userId: number,
    bookmarkId: number,
    editBookmarkDto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    const editedBookmark = await this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        ...editBookmarkDto,
        userId,
      },
    });

    return editedBookmark;
  }

  public async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    return bookmark;
  }
}
