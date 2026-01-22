import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewAuthor } from './entities/review-author.entity';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewAuthor)
    private readonly authorRepository: Repository<ReviewAuthor>,
  ) {}

  async create(dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const authorDetails = await this.resolveAuthor(dto.author_details);
    const review = this.reviewRepository.create({
      author: dto.author,
      movieId: dto.movie_id,
      authorDetails,
      content: dto.content,
      url: dto.url ?? null,
    });

    const savedReview = await this.reviewRepository.save(review);
    const reviewWithRelations = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
    });

    return ReviewResponseDto.fromEntity(reviewWithRelations ?? savedReview);
  }

  async findAll(): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find();
    return reviews.map((review) => ReviewResponseDto.fromEntity(review));
  }

  async findByMovieId(movieId: string): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find({ where: { movieId } });
    return reviews.map((review) => ReviewResponseDto.fromEntity(review));
  }

  async remove(id: string): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    await this.reviewRepository.remove(review);
  }

  private async resolveAuthor(details: CreateReviewDto['author_details']): Promise<ReviewAuthor> {
    const mappedDetails = this.mapAuthorDetails(details);
    const existingAuthor = await this.authorRepository.findOne({
      where: { username: mappedDetails.username },
    });

    if (!existingAuthor) {
      const newAuthor = this.authorRepository.create(mappedDetails);
      return this.authorRepository.save(newAuthor);
    }

    const updatedAuthor = this.authorRepository.merge(existingAuthor, mappedDetails);
    return this.authorRepository.save(updatedAuthor);
  }

  private mapAuthorDetails(
    details: CreateReviewDto['author_details'],
  ): Partial<ReviewAuthor> & Pick<ReviewAuthor, 'name' | 'username'> {
    return {
      name: details.name,
      username: details.username,
      avatarPath: details.avatar_path ?? null,
      rating:
        details.rating === undefined || details.rating === null
          ? null
          : details.rating,
    };
  }
}
