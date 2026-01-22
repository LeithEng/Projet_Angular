import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Movie } from '../../models/tmdb.model';
import { TmdbService } from '../../services/tmdb.service';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl:"./hero-banner.html",
  styleUrl:"./hero-banner.css"
})
export class HeroBannerComponent {
  movie = input<Movie | null>(null);

  private tmdbService = inject(TmdbService);
  private router = inject(Router);

  backdropUrl = computed(() => {
    const m = this.movie();
    return m ? this.tmdbService.getBackdropUrl(m.backdrop_path) : '';
  });

  navigateToDetail(): void {
    const m = this.movie();
    if (m) {
      this.router.navigate(['/movie', m.id]);
    }
  }
}