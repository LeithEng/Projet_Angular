import { IsNumber, IsEnum } from 'class-validator';

export enum ContentType {
  MOVIE = 'movie',
  TV = 'tv',
}

export class ToggleFavoriteDto {
  @IsNumber()
  contentId: number;

  @IsEnum(ContentType)
  contentType: ContentType;
}
