import { Component, ElementRef, inject, input, signal, viewChild, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TmdbService } from '../../services/tmdb.service';
import { Movie, TMDBResponse, TVShow } from '../../models/tmdb.model';
import { PosterUrlPipe } from '../../pipe/poster-url-pipe';
import { FetchType } from '../../types/fetch-type.type';
import { FETCH_TYPE } from '../../constants/fetch-type.const';
import { ContentType } from '../../types/content-type.type';
import { CONTENT_TYPE } from '../../constants/content-type.const';

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
  contentType = input<ContentType>('movie');

  // ViewChild
  scrollContainer = viewChild.required<ElementRef>('scrollContainer');

  // State
  content = signal<(Movie | TVShow)[]>([]);
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
        const cType = this.contentType();
        
        untracked(() => {
            this.resetAndLoad();
        });
    });
  }

  resetAndLoad() {
      this.content.set([]);
      this.currentPage.set(1);
      this.totalPages.set(1);
      this.loadContent();
  }

  navigateToDetail(item: Movie | TVShow): void {
     if (this.contentType() === 'movie') {
        this.router.navigate(['/movie', item.id]);
     } else {
        this.router.navigate(['/tv', item.id]);
     }
  }

  loadContent() {
    if (this.isLoading()) return;
    // Check signal values
    if (this.currentPage() > this.totalPages()) return;

    this.isLoading.set(true);

    let obs$: Observable<TMDBResponse<Movie> | TMDBResponse<TVShow>>;
    
    // Determine which API call to make
    const type = this.fetchType();
    const page = this.currentPage();
    const gId = this.genreId();
    const cType = this.contentType();

    if (cType === CONTENT_TYPE.MOVIE) {
        if (type === FETCH_TYPE.TRENDING) {
          obs$ = this.tmdbService.getTrendingMovies();
        } else if (type === FETCH_TYPE.TOP_RATED) {
          obs$ = this.tmdbService.getTopRatedMovies(page);
        } else if (type === FETCH_TYPE.GENRE && gId) {
          obs$ = this.tmdbService.discoverMovies({ 
            with_genres: gId, 
            page: page.toString() 
          });
        } else {
           obs$ = this.tmdbService.getPopularMovies(page);
        }
    } else {
        if (type === FETCH_TYPE.TRENDING) {
          obs$ = this.tmdbService.getTrendingTVShows();
        } else if (type === FETCH_TYPE.TOP_RATED) {
          obs$ = this.tmdbService.getTopRatedTVShows(page);
        } else if (type === FETCH_TYPE.GENRE && gId) {
          obs$ = this.tmdbService.discoverTVShows({ 
            with_genres: gId, 
            page: page.toString() 
          });
        } else {
           obs$ = this.tmdbService.getPopularTVShows(page);
        }
    }

    obs$.subscribe({
      next: (res: any) => {
        // Append new content to existing list
        this.content.update(current => [...current, ...res.results]);
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
      this.loadContent();
    }
  }

  getTitle(item: Movie | TVShow): string {
    return (item as Movie).title || (item as TVShow).name;
  }

  getDate(item: Movie | TVShow): string {
    return (item as Movie).release_date || (item as TVShow).first_air_date;
  }
}
