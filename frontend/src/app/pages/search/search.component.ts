import {
  Component,
  OnInit,
  signal,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TmdbService } from '../../services/tmdb.service';
import { Movie, TVShow, Genre } from '../../models/tmdb.model';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, forkJoin } from 'rxjs';
import { PosterUrlPipe } from '../../pipe/poster-url-pipe';
import { ContentType } from '../../types/content-type.type';
import { CONTENT_TYPE } from '../../constants/content-type.const';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';

type FilterType = 'all' | ContentType;
type SortOption = 'popularity' | 'rating' | 'date';

interface SearchItem {
  item: Movie | TVShow;
  type: ContentType;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PosterUrlPipe, NavbarComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  private tmdbService = inject(TmdbService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  searchResults = signal<SearchItem[]>([]);
  filteredResults = signal<SearchItem[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  hasSearched = signal(false);
  activeFilter = signal<FilterType>('all');
  activeSortOption = signal<SortOption>('popularity');

  allGenres = signal<Genre[]>([]);
  selectedGenres = signal<number[]>([]);
  showFilters = signal(false);

  readonly MOVIE = CONTENT_TYPE.MOVIE;
  readonly TV = CONTENT_TYPE.TV;

  get movieCount(): number {
    return this.searchResults().filter((r) => r.type === CONTENT_TYPE.MOVIE).length;
  }

  get tvCount(): number {
    return this.searchResults().filter((r) => r.type === CONTENT_TYPE.TV).length;
  }

  get totalCount(): number {
    return this.searchResults().length;
  }

  ngOnInit(): void {
    this.loadGenres();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const query = params['q'];

      if (query) {
        this.searchControl.setValue(query, { emitEvent: false });

        this.performSearch(query);
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),

        distinctUntilChanged(),

        tap(() => this.isLoading.set(true)),

        switchMap((query) => {
          const term = query?.trim() || '';

          if (term.length < 2) {
            this.resetSearch();

            return of({
              movies: { results: [], total_pages: 0 },
              tvShows: { results: [], total_pages: 0 },
            });
          }

          this.hasSearched.set(true);

          return this.searchContent(term, 1);
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ movies, tvShows }) => {
          const movieResults: SearchItem[] = movies.results.map((m) => ({
            item: m,
            type: CONTENT_TYPE.MOVIE,
          }));

          const tvResults: SearchItem[] = tvShows.results.map((t) => ({
            item: t,
            type: CONTENT_TYPE.TV,
          }));

          this.searchResults.set([...movieResults, ...tvResults]);

          this.applyFilters();

          this.totalPages.set(Math.max(movies.total_pages, tvShows.total_pages));

          this.currentPage.set(1);

          this.isLoading.set(false);

          this.updateURL();
        },

        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private loadGenres(): void {
    forkJoin({
      movieGenres: this.tmdbService.getMovieGenres(),
      tvGenres: this.tmdbService.getTVGenres(),
    }).subscribe({
      next: ({ movieGenres, tvGenres }) => {
        const allGenresMap = new Map<number, Genre>();
        [...movieGenres.genres, ...tvGenres.genres].forEach((genre) => {
          allGenresMap.set(genre.id, genre);
        });
        this.allGenres.set(Array.from(allGenresMap.values()));
      },
    });
  }

  toggleGenre(genreId: number): void {
    const current = this.selectedGenres();
    if (current.includes(genreId)) {
      this.selectedGenres.set(current.filter((id) => id !== genreId));
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
    this.showFilters.update((v) => !v);
  }

  private searchContent(query: string, page: number) {
    const movieSearch$ = this.tmdbService.searchMovies(query, page);
    const tvSearch$ = this.tmdbService.searchTVShows(query, page);

    return forkJoin({
      movies: movieSearch$,
      tvShows: tvSearch$,
    });
  }

  performSearch(query: string): void {
    this.isLoading.set(true);
    this.hasSearched.set(true);

    this.searchContent(query, 1).subscribe({
      next: ({ movies, tvShows }) => {
        const movieResults: SearchItem[] = movies.results.map((m) => ({
          item: m,
          type: CONTENT_TYPE.MOVIE,
        }));
        const tvResults: SearchItem[] = tvShows.results.map((t) => ({
          item: t,
          type: CONTENT_TYPE.TV,
        }));

        this.searchResults.set([...movieResults, ...tvResults]);
        this.applyFilters();
        this.totalPages.set(Math.max(movies.total_pages, tvShows.total_pages));
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: FilterType): void {
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
      results = results.filter((searchItem) => searchItem.type === this.activeFilter());
    }

    // Filter by genres
    if (this.selectedGenres().length > 0) {
      const selectedSet = new Set(this.selectedGenres());
      results = results.filter((searchItem) => {
        const genreIds = searchItem.item.genre_ids;
        if (!genreIds || genreIds.length === 0) return false;
        return genreIds.some((genreId) => selectedSet.has(genreId));
      });
    }

    // Sort results
    switch (this.activeSortOption()) {
      case 'popularity':
        results.sort((a, b) => (b.item.popularity || 0) - (a.item.popularity || 0));
        break;
      case 'rating':
        results.sort((a, b) => (b.item.vote_average || 0) - (a.item.vote_average || 0));
        break;
      case 'date':
        results.sort((a, b) => {
          const dateA = this.getItemDate(a);
          const dateB = this.getItemDate(b);
          return dateB - dateA;
        });
        break;
    }

    this.filteredResults.set(results);
  }

  private getItemDate(searchItem: SearchItem): number {
    if (searchItem.type === CONTENT_TYPE.MOVIE) {
      return new Date((searchItem.item as Movie).release_date || 0).getTime();
    } else {
      return new Date((searchItem.item as TVShow).first_air_date || 0).getTime();
    }
  }

  loadMore(): void {
    const query = this.searchControl.value?.trim();
    if (!query || this.currentPage() >= this.totalPages()) return;

    this.isLoading.set(true);
    const nextPage = this.currentPage() + 1;

    this.searchContent(query, nextPage).subscribe({
      next: ({ movies, tvShows }) => {
        const movieResults: SearchItem[] = movies.results.map((m) => ({
          item: m,
          type: CONTENT_TYPE.MOVIE,
        }));
        const tvResults: SearchItem[] = tvShows.results.map((t) => ({
          item: t,
          type: CONTENT_TYPE.TV,
        }));

        this.searchResults.update((current) => [...current, ...movieResults, ...tvResults]);
        this.applyFilters();
        this.currentPage.set(nextPage);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  navigateToDetail(searchItem: SearchItem): void {
    this.router.navigate([`/${searchItem.type}`, searchItem.item.id]);
  }

  getTitle(searchItem: SearchItem): string {
    if (searchItem.type === CONTENT_TYPE.MOVIE) {
      return (searchItem.item as Movie).title;
    }
    return (searchItem.item as TVShow).name;
  }

  getYear(searchItem: SearchItem): string {
    let date: string;
    if (searchItem.type === CONTENT_TYPE.MOVIE) {
      date = (searchItem.item as Movie).release_date;
    } else {
      date = (searchItem.item as TVShow).first_air_date;
    }
    return date ? new Date(date).getFullYear().toString() : '';
  }

  getMediaTypeBadge(searchItem: SearchItem): string {
    return searchItem.type === CONTENT_TYPE.TV ? 'TV Show' : 'Movie';
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
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
