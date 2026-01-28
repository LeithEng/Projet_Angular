import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TmdbService } from '../../services/tmdb.service';
import { Movie, Genre } from '../../models/tmdb.model';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, forkJoin } from 'rxjs';
import { PosterUrlPipe } from '../../pipe/poster-url-pipe';

type ContentType = 'all' | 'movie' | 'tv';
type SortOption = 'popularity' | 'rating' | 'date';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  overview: string;
  genre_ids?: number[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PosterUrlPipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private tmdbService = inject(TmdbService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  searchResults = signal<SearchResult[]>([]);
  filteredResults = signal<SearchResult[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  hasSearched = signal(false);
  
  activeFilter = signal<ContentType>('all');
  activeSortOption = signal<SortOption>('popularity');
  
  // Genre filters
  allGenres = signal<Genre[]>([]);
  selectedGenres = signal<number[]>([]);
  showFilters = signal(false);

  // Computed counts for filters
  get movieCount(): number {
    return this.searchResults().filter(r => r.media_type === 'movie').length;
  }

  get tvCount(): number {
    return this.searchResults().filter(r => r.media_type === 'tv').length;
  }

  get totalCount(): number {
    return this.searchResults().length;
  }

  ngOnInit(): void {
    // Load genres
    this.loadGenres();

    // Get query param from URL
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const query = params['q'];
        if (query) {
          this.searchControl.setValue(query, { emitEvent: false });
          this.performSearch(query);
        }
      });

    // Listen to search input changes
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => this.isLoading.set(true)),
        switchMap(query => {
          const term = query?.trim() || '';
          if (term.length < 2) {
            this.resetSearch();
            return of({ movies: { results: [], total_pages: 0 }, tvShows: { results: [], total_pages: 0 } });
          }
          this.hasSearched.set(true);
          return this.searchContent(term, 1);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ movies, tvShows }) => {
          const movieResults = movies.results.map(m => ({ ...m, media_type: 'movie' }));
          const tvResults = tvShows.results.map(t => ({ ...t, media_type: 'tv' }));
          
          this.searchResults.set([...movieResults, ...tvResults]);
          this.applyFilters();
          this.totalPages.set(Math.max(movies.total_pages, tvShows.total_pages));
          this.currentPage.set(1);
          this.isLoading.set(false);
          this.updateURL();
        },
        error: (err) => {
          console.error('Search error:', err);
          this.isLoading.set(false);
        }
      });
  }

  private loadGenres(): void {
    forkJoin({
      movieGenres: this.tmdbService.getMovieGenres(),
      tvGenres: this.tmdbService.getTVGenres()
    }).subscribe({
      next: ({ movieGenres, tvGenres }) => {
        // Combine and remove duplicates
        const allGenresMap = new Map<number, Genre>();
        [...movieGenres.genres, ...tvGenres.genres].forEach(genre => {
          allGenresMap.set(genre.id, genre);
        });
        this.allGenres.set(Array.from(allGenresMap.values()));
      },
      error: (err) => console.error('Error loading genres:', err)
    });
  }

  toggleGenre(genreId: number): void {
    const current = this.selectedGenres();
    if (current.includes(genreId)) {
      this.selectedGenres.set(current.filter(id => id !== genreId));
    } else {
      this.selectedGenres.set([...current, genreId]);
    }
    this.applyFilters();
  }

  clearGenres(): void {
    this.selectedGenres.set([]);
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  private searchContent(query: string, page: number) {
    // Search both movies and TV shows
    const movieSearch$ = this.tmdbService.searchMovies(query, page);
    const tvSearch$ = this.tmdbService.searchTVShows(query, page);

    return forkJoin({
      movies: movieSearch$,
      tvShows: tvSearch$
    });
  }

  performSearch(query: string): void {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    
    this.searchContent(query, 1).subscribe({
      next: ({ movies, tvShows }) => {
        // Combine and mark results with media_type
        const movieResults = movies.results.map(m => ({ ...m, media_type: 'movie' }));
        const tvResults = tvShows.results.map(t => ({ ...t, media_type: 'tv' }));
        
        this.searchResults.set([...movieResults, ...tvResults]);
        this.applyFilters();
        this.totalPages.set(Math.max(movies.total_pages, tvShows.total_pages));
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: ContentType): void {
    this.activeFilter.set(filter);
    this.applyFilters();
  }

  setSortOption(option: SortOption): void {
    this.activeSortOption.set(option);
    this.applyFilters();
  }

  private applyFilters(): void {
    let results = [...this.searchResults()];

    // Filter by content type
    if (this.activeFilter() !== 'all') {
      results = results.filter(item => item.media_type === this.activeFilter());
    }

    // Filter by genres
    if (this.selectedGenres().length > 0) {
      results = results.filter(item => {
        if (!item.genre_ids || item.genre_ids.length === 0) return false;
        // Check if item has at least one of the selected genres
        return this.selectedGenres().some(genreId => item.genre_ids!.includes(genreId));
      });
    }

    // Sort results
    switch (this.activeSortOption()) {
      case 'popularity':
        results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'rating':
        results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'date':
        results.sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
          const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    this.filteredResults.set(results);
  }

  loadMore(): void {
    const query = this.searchControl.value?.trim();
    if (!query || this.currentPage() >= this.totalPages()) return;

    this.isLoading.set(true);
    const nextPage = this.currentPage() + 1;

    this.searchContent(query, nextPage).subscribe({
      next: ({ movies, tvShows }) => {
        const movieResults = movies.results.map(m => ({ ...m, media_type: 'movie' }));
        const tvResults = tvShows.results.map(t => ({ ...t, media_type: 'tv' }));
        
        this.searchResults.update(current => [...current, ...movieResults, ...tvResults]);
        this.applyFilters();
        this.currentPage.set(nextPage);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Load more error:', err);
        this.isLoading.set(false);
      }
    });
  }

  navigateToDetail(item: SearchResult): void {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    this.router.navigate([`/${type}`, item.id]);
  }

  getTitle(item: SearchResult): string {
    return item.title || item.name || 'Untitled';
  }

  getYear(item: SearchResult): string {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  }

  getMediaTypeBadge(item: SearchResult): string {
    return item.media_type === 'tv' ? 'TV Show' : 'Movie';
  }

  private resetSearch(): void {
    this.searchResults.set([]);
    this.filteredResults.set([]);
    this.currentPage.set(1);
    this.totalPages.set(1);
    this.isLoading.set(false);
  }

  private updateURL(): void {
    const query = this.searchControl.value?.trim();
    if (query) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: query },
        queryParamsHandling: 'merge',
      });
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.resetSearch();
    this.hasSearched.set(false);
    this.router.navigate(['/search']);
  }

  goBack(): void {
    window.history.back();
  }
}