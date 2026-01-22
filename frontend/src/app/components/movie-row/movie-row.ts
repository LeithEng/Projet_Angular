import { Component, ElementRef, inject, input, signal, viewChild, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Movie } from '../../models/tmdb.model';
import { PosterUrlPipe } from '../../pipe/poster-url-pipe';
import { FetchType } from '../../types/fetch-type.type';
import { FETCH_TYPE } from '../../constants/fetch-type.const';

@Component({
  selector: 'app-movie-row',
  standalone: true,
  imports: [CommonModule, PosterUrlPipe],
  templateUrl: './movie-row.html',
  styleUrl : "./movie-row.css"
})
export class MovieRowComponent {
  // Inputs
  title = input.required<string>();
  fetchType = input<FetchType>(FETCH_TYPE.TRENDING);
  genreId = input<string | undefined>(undefined);
  isLarge = input<boolean>(false);

  // ViewChild
  scrollContainer = viewChild.required<ElementRef>('scrollContainer');

  // State
  movies = signal<Movie[]>([]);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(false);
  totalPages = signal<number>(1);

  private tmdbService = inject(TmdbService);
  private router = inject(Router);

  constructor() {
    // React to inputs changes to reset and reload
    effect(() => {
        // dep tracking
        const type = this.fetchType();
        const genre = this.genreId();
        
        untracked(() => {
            this.resetAndLoad();
        });
    });
  }

  resetAndLoad() {
      this.movies.set([]);
      this.currentPage.set(1);
      this.totalPages.set(1);
      this.loadMovies();
  }

  navigateToDetail(movieId: number): void {
    this.router.navigate(['/movie', movieId]);
  }

  loadMovies() {
    if (this.isLoading()) return;
    // Check signal values
    if (this.currentPage() > this.totalPages()) return;

    this.isLoading.set(true);

    let obs$;
    
    // Determine which API call to make
    const type = this.fetchType();
    const page = this.currentPage();
    const gId = this.genreId();

    if (type === FETCH_TYPE.TRENDING) {
      obs$ = this.tmdbService.getTrendingMovies(); // Trending usually doesn't paginate via generic endpoint easily, simplifying to popular for pagination or keeping purely trending
    } else if (type === FETCH_TYPE.TOP_RATED) {
      obs$ = this.tmdbService.getTopRatedMovies(page);
    } else if (type === FETCH_TYPE.GENRE && gId) {
      obs$ = this.tmdbService.discoverMovies({ 
        with_genres: gId, 
        page: page.toString() 
      });
    } else {
       // Default to popular if nothing matches
       obs$ = this.tmdbService.getPopularMovies(page);
    }

    obs$.subscribe({
      next: (res) => {
        // Append new movies to existing list
        this.movies.update(current => [...current, ...res.results]);
        this.totalPages.set(res.total_pages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching row data', err);
        this.isLoading.set(false);
      }
    });
  }

  // Infinite Scroll Logic (Horizontal)
  onScroll() {
    const element = this.scrollContainer().nativeElement;
    // Check if we are near the right edge
    const atRightEdge = element.scrollLeft + element.clientWidth >= element.scrollWidth - 100; // 100px buffer

    if (atRightEdge && !this.isLoading()) {
      this.currentPage.update(p => p + 1);
      this.loadMovies();
    }
  }
}
