import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReviewAuthorDetailsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsString()
  profile_image?: string | null;

  @IsOptional()
  @IsNumber()
  rating?: number | null;
}

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  movie_id: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @ValidateNested()
  @Type(() => ReviewAuthorDetailsDto)
  author_details: ReviewAuthorDetailsDto;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
