import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewAuthor } from './entities/review-author.entity';
import { Review } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewAuthor])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
