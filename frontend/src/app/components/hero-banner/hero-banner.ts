import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Movie, TVShow } from '../../models/tmdb.model';
import { TmdbService } from '../../services/tmdb.service';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl:"./hero-banner.html",
  styleUrl:"./hero-banner.css"
})
export class HeroBannerComponent {
  item = input<Movie | TVShow | null>(null);

  private tmdbService = inject(TmdbService);
  private router = inject(Router);

  backdropUrl = computed(() => {
    const m = this.item();
    return m ? this.tmdbService.getBackdropUrl(m.backdrop_path) : '';
  });

  title = computed(() => {
    const m = this.item();
    if (!m) return '';
    return (m as Movie).title || (m as TVShow).name;
  });

  releaseDate = computed(() => {
    const m = this.item();
    if (!m) return '';
    return (m as Movie).release_date || (m as TVShow).first_air_date;
  });

  navigateToDetail(): void {
    const m = this.item();
    if (m) {
      if ('title' in m) {
        this.router.navigate(['/movie', m.id]);
      } else {
        this.router.navigate(['/tv', m.id]);
      }
    }
  }
}