import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { MovieDetails, Cast, Crew, Review, Movie, Video } from '../../models/tmdb.model';
import { forkJoin, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MediaCarouselComponent } from '../../shared-componants/media-carousel/media-carousel.component';
import { VideoGalleryComponent } from '../../shared-componants/video-gallery/video-gallery.component';
import { YoutubePlayerComponent } from '../../components/youtube-player/youtube-player.component';
import { CreateReviewComponent } from '../../components/create-review/create-review.component';
import { TmdbImagePipe } from '../../pipe/tmdb-image.pipe';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    MediaCarouselComponent,
    VideoGalleryComponent,
    YoutubePlayerComponent,
    CreateReviewComponent,
    TmdbImagePipe,
  ],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css',
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdbService = inject(TmdbService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);

  movieDetails = signal<MovieDetails | null>(null);
  cast = signal<Cast[]>([]);
  similarMovies = signal<Movie[]>([]);
  videos = signal<Video[]>([]);
  userReviews = signal<any[]>([]);
  tmdbReviews = signal<Review[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedVideo = signal<Video | null>(null);
  isFavorite = signal(false);
  favoriteLoading = signal(false);
  director = signal<Crew | null>(null);
  writers = signal<string>('');

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          this.error.set(null);
          const id = +params['id'];

          // Vérifier si l'ID est valide
          if (!id || isNaN(id)) {
            throw new Error('Invalid movie ID');
          }
          return forkJoin({
            details: this.tmdbService.getMovieDetails(id),
            credits: this.tmdbService.getMovieCredits(id),
            similar: this.tmdbService.getSimilarMovies(id),
            videos: this.tmdbService.getMovieVideos(id),
            tmdbReviews: this.tmdbService.getMovieReviews(id).pipe(
              catchError((err) => {
                console.warn('Failed to load TMDB reviews:', err);
                return of({ id: id, page: 1, results: [], total_pages: 0, total_results: 0 });
              }),
            ),
            userReviews: this.reviewService.getReviewsByMovieId(id.toString()).pipe(
              catchError((err) => {
                console.warn('Failed to load user reviews:', err);
                return of([]); // Retourner un tableau vide en cas d'erreur
              }),
            ),
          });
        }),
      )
      .subscribe({
        next: (data) => {
          this.movieDetails.set(data.details);
          this.cast.set(data.credits.cast.slice(0, 15));
          this.similarMovies.set(data.similar.results.slice(0, 12));
          this.videos.set(data.videos.results.filter((v) => v.site === 'YouTube'));
          this.userReviews.set(data.userReviews || []);
          this.tmdbReviews.set(data.tmdbReviews.results || []);

          // Crew logic
          this.director.set(data.credits.crew.find((c) => c.job === 'Director') || null);
          const writersNames = data.credits.crew
            .filter((c) => c.department === 'Writing')
            .slice(0, 3)
            .map((w) => w.name)
            .join(', ');
          this.writers.set(writersNames);
          this.checkFavoriteStatus();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading movie details:', err);
          this.error.set('Failed to load movie details. Please try again.');
          this.loading.set(false);
        },
      });
  }

  checkFavoriteStatus(): void {
    const user = this.authService.currentUserValue;
    if (user && user.favoriteMovies && this.movieDetails()) {
      this.isFavorite.set(user.favoriteMovies.includes(this.movieDetails()!.id));
    }
  }

  toggleFavorite(): void {
    if (!this.movieDetails()) return;

    this.favoriteLoading.set(true);

    this.authService.toggleFavorite(this.movieDetails()!.id, 'movie').subscribe({
      next: (response) => {
        this.isFavorite.set(response.isFavorite);
        this.favoriteLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to toggle favorite:', err);
        this.favoriteLoading.set(false);
      },
    });
  }

  // Event handlers
  onVideoSelect(video: Video) {
    this.selectedVideo.set(video);
  }
  onMovieClick(movie: Movie) {
    this.router.navigate(['/movie', movie.id]);
  }
  onReviewCreated() {
    if (this.movieDetails()) {
      const id = this.movieDetails()!.id;
      this.reviewService.getReviewsByMovieId(id.toString()).subscribe({
        next: (reviews) => this.userReviews.set(reviews),
        error: (err) => console.error('Error refreshing reviews:', err),
      });
    }
  }
  goBack() {
    this.router.navigate(['/movie']);
  }
}
