import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import {
  TVShowDetails,
  Credits,
  Cast,
  Crew,
  Review,
  TVShow,
  Video,
} from '../../models/tmdb.model';
import { forkJoin } from 'rxjs';
import { YoutubePlayerComponent } from '../../components/youtube-player/youtube-player.component';

@Component({
  selector: 'app-tv-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, YoutubePlayerComponent],
  templateUrl: './tv-detail.component.html',
  styleUrl: './tv-detail.component.css',
})
export class TvDetailComponent implements OnInit {
  tvDetails = signal<TVShowDetails | null>(null);
  cast = signal<Cast[]>([]);
  crew = signal<Crew[]>([]);
  reviews = signal<Review[]>([]);
  similarShows = signal<TVShow[]>([]);
  videos = signal<Video[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Trailer player state
  selectedVideo = signal<Video | null>(null);
  showPlayer = signal(false);

  // Filtered crew members
  creators = signal<Crew[]>([]);
  writers = signal<Crew[]>([]);
  producers = signal<Crew[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tmdbService: TmdbService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const tvId = +params['id'];
      if (tvId) {
        this.loadTVShowData(tvId);
      }
    });
  }

  loadTVShowData(tvId: number): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      details: this.tmdbService.getTVShowDetails(tvId),
      credits: this.tmdbService.getTVShowCredits(tvId),
      reviews: this.tmdbService.getTVShowReviews(tvId),
      similar: this.tmdbService.getSimilarTVShows(tvId),
      videos: this.tmdbService.getTVShowVideos(tvId),
    }).subscribe({
      next: (data) => {
        this.tvDetails.set(data.details);
        this.cast.set(data.credits.cast.slice(0, 20)); // Top 20 cast members
        this.crew.set(data.credits.crew);
        this.reviews.set(data.reviews.results);
        this.similarShows.set(data.similar.results.slice(0, 12));
        
        // Filter for trailers and teasers
        const trailers = data.videos.results.filter(
          (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        this.videos.set(trailers);

        // Filter crew members
        this.creators.set(
          data.credits.crew.filter((c) => c.job === 'Creator' || c.job === 'Executive Producer')
        );
        this.writers.set(
          data.credits.crew.filter(
            (c) => c.department === 'Writing' && (c.job === 'Writer' || c.job === 'Screenplay')
          )
        );
        this.producers.set(data.credits.crew.filter((c) => c.job === 'Producer').slice(0, 3));

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading TV show data:', err);
        this.error.set('Failed to load TV show details. Please try again.');
        this.loading.set(false);
      },
    });
  }

  getPosterUrl(path: string | null): string {
    return this.tmdbService.getPosterUrl(path);
  }

  getBackdropUrl(path: string | null): string {
    return this.tmdbService.getBackdropUrl(path);
  }

  getProfileUrl(path: string | null): string {
    return this.tmdbService.getProfileUrl(path);
  }

  getRatingPercentage(rating: number): number {
    return Math.round(rating * 10);
  }

  getRatingClass(rating: number): string {
    const percentage = this.getRatingPercentage(rating);
    if (percentage >= 70) return 'rating-good';
    if (percentage >= 50) return 'rating-average';
    return 'rating-poor';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getYear(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear().toString();
  }

  truncateText(text: string, maxLength: number = 200): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getCreatorsNames(): string {
    return this.creators().map(c => c.name).join(', ');
  }

  getWritersNames(): string {
    return this.writers().map(w => w.name).join(', ');
  }

  getProducersNames(): string {
    return this.producers().map(p => p.name).join(', ');
  }

  playTrailer(video: Video): void {
    this.selectedVideo.set(video);
    this.showPlayer.set(true);
  }

  closePlayer(): void {
    this.showPlayer.set(false);
    this.selectedVideo.set(null);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  navigateToShow(tvId: number): void {
    this.router.navigate(['/tv', tvId]);
  }
}
