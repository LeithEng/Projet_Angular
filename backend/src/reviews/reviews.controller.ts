import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() dto: CreateReviewDto): Promise<ReviewResponseDto> {
    return this.reviewsService.create(dto);
  }

  @Get('movie/:movieId')
  async findByMovieId(
    @Param('movieId') movieId: string,
  ): Promise<ReviewResponseDto[]> {
    return (await this.reviewsService.findByMovieId(movieId)).reverse();
  }

  @Get()
  async findAll(): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.reviewsService.remove(id);
  }
}
