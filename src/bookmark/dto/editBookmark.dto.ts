import { PartialType } from '@nestjs/mapped-types';
import { CreateBookmarkDto } from '.';

export class EditBookmarkDto extends PartialType(CreateBookmarkDto) {}
