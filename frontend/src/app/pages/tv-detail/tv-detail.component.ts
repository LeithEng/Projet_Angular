import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { AuthService } from '../../services/auth.service';
import { TVShowDetails, Cast, TVShow, Video } from '../../models/tmdb.model';
import { forkJoin, switchMap } from 'rxjs';
import { MediaCarouselComponent } from '../../shared-componants/media-carousel/media-carousel.component';
import { VideoGalleryComponent } from '../../shared-componants/video-gallery/video-gallery.component';
import { YoutubePlayerComponent } from '../../components/youtube-player/youtube-player.component';
import { TmdbImagePipe } from '../../pipe/tmdb-image.pipe';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { ROUTES } from '../../constants/route.const';

@Component({
  selector: 'app-tv-detail',
  standalone: true,
  imports: [
    CommonModule,
    MediaCarouselComponent,
    VideoGalleryComponent,
    YoutubePlayerComponent,
    TmdbImagePipe,
    NavbarComponent
  ],
  templateUrl: './tv-detail.component.html',
  styleUrl: './tv-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TvDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdbService = inject(TmdbService);
  private authService = inject(AuthService);

  tvDetails = signal<TVShowDetails | null>(null);
  cast = signal<Cast[]>([]);
  similarShows = signal<TVShow[]>([]);
  videos = signal<Video[]>([]);
  loading = signal(true);
  selectedVideo = signal<Video | null>(null);
  isFavorite = signal(false);
  favoriteLoading = signal(false);

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          return forkJoin({
            details: this.tmdbService.getTVShowDetails(+params['id']),
            credits: this.tmdbService.getTVShowCredits(+params['id']),
            similar: this.tmdbService.getSimilarTVShows(+params['id']),
            videos: this.tmdbService.getTVShowVideos(+params['id']),
          });
        }),
      )
      .subscribe((data) => {
        this.tvDetails.set(data.details);
        this.cast.set(data.credits.cast.slice(0, 15));
        this.similarShows.set(data.similar.results);
        this.videos.set(data.videos.results.filter((v) => v.site === 'YouTube'));
        this.checkFavoriteStatus();
        this.loading.set(false);
      });
  }

  checkFavoriteStatus(): void {
    const user = this.authService.currentUserValue;
    if (user && user.favoriteTvShows && this.tvDetails()) {
      this.isFavorite.set(user.favoriteTvShows.includes(this.tvDetails()!.id));
    }
  }

  toggleFavorite(): void {
    if (!this.tvDetails()) return;

    this.favoriteLoading.set(true);

    this.authService.toggleFavorite(this.tvDetails()!.id, 'tv').subscribe({
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

  onShowClick(show: TVShow) {
    this.router.navigate(['/',ROUTES.TV, show.id]);
  }
  goBack() {
    this.router.navigate(['/',ROUTES.TV]);
  }
}
