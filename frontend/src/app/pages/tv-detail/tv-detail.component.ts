import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { TVShowDetails, Cast, TVShow, Video } from '../../models/tmdb.model';
import { forkJoin, switchMap } from 'rxjs';

import { MediaCarouselComponent } from '../../shared-componants/media-carousel/media-carousel.component';
import { VideoGalleryComponent } from '../../shared-componants/video-gallery/video-gallery.component';
import { YoutubePlayerComponent } from '../../components/youtube-player/youtube-player.component';
import { TmdbImagePipe } from '../../pipe/tmdb-image.pipe';

@Component({
  selector: 'app-tv-detail',
  standalone: true,
  imports: [CommonModule, MediaCarouselComponent, VideoGalleryComponent, YoutubePlayerComponent, TmdbImagePipe],
  templateUrl: './tv-detail.component.html',
  styleUrl: './tv-detail.component.css'
})
export class TvDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdbService = inject(TmdbService);

  tvDetails = signal<TVShowDetails | null>(null);
  cast = signal<Cast[]>([]);
  similarShows = signal<TVShow[]>([]);
  videos = signal<Video[]>([]);
  loading = signal(true);
  selectedVideo = signal<Video | null>(null);

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        this.loading.set(true);
        return forkJoin({
          details: this.tmdbService.getTVShowDetails(+params['id']),
          credits: this.tmdbService.getTVShowCredits(+params['id']),
          similar: this.tmdbService.getSimilarTVShows(+params['id']),
          videos: this.tmdbService.getTVShowVideos(+params['id'])
        });
      })
    ).subscribe(data => {
      this.tvDetails.set(data.details);
      this.cast.set(data.credits.cast.slice(0, 15));
      this.similarShows.set(data.similar.results);
      this.videos.set(data.videos.results.filter(v => v.site === 'YouTube'));
      this.loading.set(false);
    });
  }

  onShowClick(show: TVShow) { this.router.navigate(['/tv', show.id]); }
  goBack() { this.router.navigate(['/tv']); }
}