import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
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

type FilterType = 'all' | ContentType;
type SortOption = 'popularity' | 'rating' | 'date';

interface SearchItem {
  item: Movie | TVShow;
  type: ContentType;
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
  //Gives access to the current route information
  private route = inject(ActivatedRoute);
  //Navigates programmatically between pages
  private router = inject(Router);
  //Lets you clean up resources when the component is destroyed
  private destroyRef = inject(DestroyRef);

  //reactive form control for the search input : holds value of input
  searchControl = new FormControl('');
  searchResults = signal<SearchItem[]>([]);
  filteredResults = signal<SearchItem[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  //Boolean signal tracking if a search was performed
  hasSearched = signal(false);
  //filter 7asb content type
  activeFilter = signal<FilterType>('all');
  activeSortOption = signal<SortOption>('popularity');

  // Genre filters
  //A list of all available genres
  allGenres = signal<Genre[]>([]);
  //The IDs of genres selected by the user
  selectedGenres = signal<number[]>([]);
  //Boolean to show/hide the filters panel
  showFilters = signal(false);

  // Content type constants
  //A read-only class property : Exposes the MOVIE enum/value to the template
  readonly MOVIE = CONTENT_TYPE.MOVIE;
  readonly TV = CONTENT_TYPE.TV;

  // Computed counts for filters
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
    // 1️⃣ Load available genres when component initializes
    this.loadGenres();

    // 2️⃣ Listen to URL query parameters (?q=...)
    // this.route.queryParams is an observable that emits whenever the query parameters change (ActivatedRoute.queryParams emits ONLY when Angular navigation happens.)
    // This allows restoring search state when refreshing or sharing the URL
    this.route.queryParams
      //pipe() is a method that lets you transform, filter, control, or combine an Observable before subscribing to it.
      .pipe(
        // Automatically unsubscribe when component is destroyed
        //If you don’t unsubscribe → ❌ memory leaks
        takeUntilDestroyed(this.destroyRef),
      )
      //emis params
      .subscribe((params) => {
        const query = params['q'];

        // If a search query exists in the URL
        if (query) {
          // Update the input field WITHOUT triggering valueChanges
          // Normally, updating the value triggers valueChanges Observable
          this.searchControl.setValue(query, { emitEvent: false });
          //if not false :

          // Manually trigger search using the query from URL
          this.performSearch(query);
        }
      });

    // 3️⃣ Listen to user typing in the search input
    this.searchControl.valueChanges
      .pipe(
        // Wait 500ms after user stops typing
        // Prevents firing API calls on every keystroke
        debounceTime(500),

        // Only emit when value actually changes
        distinctUntilChanged(),

        // Side effect: show loading spinner immediately
        tap(() => this.isLoading.set(true)),

        /*Takes each value from the source Observable
        Maps it to a new inner Observable (like an API call)
        Automatically cancels the previous inner Observable if a new value comes in*/
        switchMap((query) => {
          const term = query?.trim() || '';

          // If search term is too short
          if (term.length < 2) {
            // Reset all search state
            this.resetSearch();

            // Return empty observable result to keep stream alive
            //of() is a function from RxJS : It creates an Observable that emits the value you pass and then completes immediately
            return of({
              movies: { results: [], total_pages: 0 },
              tvShows: { results: [], total_pages: 0 },
            });
          }

          // Mark that the user has performed a search
          this.hasSearched.set(true);

          // Call API for movies + TV shows (page 1)
          return this.searchContent(term, 1);
        }),

        // Ensure cleanup when component is destroyed
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        // 4️⃣ Successful API response
        // next = function that runs every time the Observable emits a value
        next: ({ movies, tvShows }) => {
          // Map movie results to unified SearchItem format
          const movieResults: SearchItem[] = movies.results.map((m) => ({
            item: m,
            type: CONTENT_TYPE.MOVIE,
          }));

          // Map TV results to unified SearchItem format
          const tvResults: SearchItem[] = tvShows.results.map((t) => ({
            item: t,
            type: CONTENT_TYPE.TV,
          }));

          // Combine movies + TV results into one array
          this.searchResults.set([...movieResults, ...tvResults]);

          // Apply active filters (type, genre, sorting)
          this.applyFilters();

          // Set total pages based on max pages from both APIs
          //Pagination continues until both result sets are exhausted
          this.totalPages.set(Math.max(movies.total_pages, tvShows.total_pages));

          // Reset pagination to first page
          this.currentPage.set(1);

          // Hide loading spinner
          this.isLoading.set(false);

          // Update URL (?q=searchTerm)
          this.updateURL();
        },

        // 5️⃣ Error handling
        error: (err) => {
          console.error('Search error:', err);

          // Always stop loading spinner on error
          this.isLoading.set(false);
        },
      });
  }

  private loadGenres(): void {
    /*Runs multiple Observables in parallel
    Waits until ALL of them complete
    Emits ONE single value with all results together
    Then completes*/
    forkJoin({
      movieGenres: this.tmdbService.getMovieGenres(),
      tvGenres: this.tmdbService.getTVGenres(),
    }).subscribe({
      next: ({ movieGenres, tvGenres }) => {
        // Combine and remove duplicates
        const allGenresMap = new Map<number, Genre>();
        [...movieGenres.genres, ...tvGenres.genres].forEach((genre) => {
          allGenresMap.set(genre.id, genre);
        });
        this.allGenres.set(Array.from(allGenresMap.values()));
      },
      error: (err) => console.error('Error loading genres:', err),
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
    // Search both movies and TV shows
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
      error: (err) => {
        console.error('Search error:', err);
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
      results = results.filter((searchItem) => {
        const genreIds = searchItem.item.genre_ids;
        if (!genreIds || genreIds.length === 0) return false;
        // Check if item has at least one of the selected genres
        return this.selectedGenres().some((genreId) => genreIds.includes(genreId));
      });
    }

    // Sort results
    switch (this.activeSortOption()) {
      case 'popularity':
        results.sort((a, b) => (b.item.vote_average || 0) - (a.item.vote_average || 0));
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
      error: (err) => {
        console.error('Load more error:', err);
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
    window.history.back();
  }
}
