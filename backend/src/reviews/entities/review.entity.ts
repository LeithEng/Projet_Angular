import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewAuthor } from './review-author.entity';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  author: string;

  @Index('idx_reviews_movie_id')
  @Column({ name: 'movie_id', length: 50 })
  movieId: string;

  @ManyToOne(() => ReviewAuthor, (authorDetails) => authorDetails.reviews, {
    eager: true,
    cascade: ['insert', 'update'],
    nullable: false,
  })
  authorDetails: ReviewAuthor;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
