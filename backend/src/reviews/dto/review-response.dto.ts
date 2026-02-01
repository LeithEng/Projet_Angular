import { Review } from '../entities/review.entity';

interface ReviewAuthorDetailsResponse {
  name: string;
  username: string;
  profile_image: string | null;
  rating: number | null;
}

export class ReviewResponseDto {
  id: string;
  author: string;
  author_details: ReviewAuthorDetailsResponse;
  content: string;
  created_at: string;
  updated_at: string;
  url: string | null;

  static fromEntity(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      author: review.author,
      author_details: {
        name: review.authorDetails.name,
        username: review.authorDetails.username,
        profile_image: review.authorDetails.profileImage,
        rating: review.authorDetails.rating,
      },
      content: review.content,
      created_at: review.createdAt.toISOString(),
      updated_at: review.updatedAt.toISOString(),
      url: review.url,
    };
  }
}
