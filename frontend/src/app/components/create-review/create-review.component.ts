import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewService, CreateReviewRequest } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-create-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-review.component.html',
  styleUrl: './create-review.component.css',
})
export class CreateReviewComponent implements OnInit 
{
  @Input() movieId!: string;
  @Input() movieTitle!: string;
  @Output() reviewCreated = new EventEmitter<void>();

  content = signal('');
  rating = signal<number | null>(null);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  private  reviewService : ReviewService = inject(ReviewService);
  private authService : AuthService = inject(AuthService);
  constructor() 
  {
    toObservable(this.content)
      .pipe(
        debounceTime(500),
        takeUntilDestroyed()
      )
      .subscribe((value) => {
        if (this.movieId) {
          localStorage.setItem(this.movieId, value);
        }
      });
    
  }

  get currentUser() {
    return this.authService.currentUserSignal();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
      const savedReview = localStorage.getItem(this.movieId);
      if (savedReview) {
        this.content.set(savedReview);
      }
  }



  setRating(rating: number): void {
    this.rating.set(rating);
  }

  submitReview(): void {
    if (!this.isAuthenticated) {
      this.error.set('You must be logged in to submit a review');
      return;
    }

    if (!this.content().trim()) {
      this.error.set('Please write a review');
      return;
    }

    if (!this.currentUser) {
      this.error.set('User information not available');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const review: CreateReviewRequest = {
      movie_id: this.movieId,
      author: this.currentUser.username,
      author_details: {
        name: this .currentUser.username,
        username: this.currentUser.username,
        avatar_path: null,
        rating: this.rating(),
      },
      content: this.content(),
    };

    this.reviewService.createReview(review).subscribe({
      next: () => {
        this.success.set(true);
        this.content.set('');
        this.rating.set(null);
        this.submitting.set(false);
        localStorage.removeItem(this.movieId);
        this.reviewCreated.emit();
        
        // Reset success message after 3 seconds
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.error.set('Failed to submit review. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  cancelReview(): void {
    this.content.set('');
    this.rating.set(null);
    this.error.set(null);
  }
}
