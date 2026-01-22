import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { Review } from './review.entity';

@Entity({ name: 'review_authors' })
@Unique(['username'])
export class ReviewAuthor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  username: string;

  @Column({
    name: 'avatar_path',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatarPath: string | null;

  @Column({ type: 'float', nullable: true })
  rating: number | null;

  @OneToMany('Review', 'authorDetails')
  reviews: Review[];
}
