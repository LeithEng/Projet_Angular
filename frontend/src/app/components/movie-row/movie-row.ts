import { Component, ElementRef, computed, inject, input, viewChild } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { catchError, map, scan, shareReplay, startWith, switchMap, tap, withLatestFrom, filter, exhaustMap } from 'rxjs/operators';
import { TmdbService } from '../../services/tmdb.service';
import { Movie, TMDBResponse, TVShow } from '../../models/tmdb.model';
import { PosterUrlPipe } from '../../pipe/poster-url-pipe';
import { FetchType } from '../../types/fetch-type.type';
import { FETCH_TYPE } from '../../constants/fetch-type.const';
import { ContentType } from '../../types/content-type.type';
import { CONTENT_TYPE } from '../../constants/content-type.const';

// 1. Define a clean View Model interface for the template
interface RowViewModel {
  items: (Movie | TVShow)[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
}

const INITIAL_STATE: RowViewModel = {
  items: [],
  isLoading: false,
  currentPage: 0, // 0 indicates we haven't started fetching
  totalPages: 1
};

@Component({
  selector: 'app-movie-row',
  standalone: true,
  imports: [CommonModule, PosterUrlPipe],
  templateUrl: './movie-row.html',
  styleUrl: "./movie-row.css"
})
export class MovieRowComponent {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);

  // --- Inputs (Signals) ---
  title = input.required<string>();
  fetchType = input<FetchType>(FETCH_TYPE.TRENDING);
  genreId = input<string | undefined>(undefined);
  isLarge = input<boolean>(false);
  contentType = input<ContentType>(CONTENT_TYPE.MOVIE);
  scrollContainer = viewChild.required<ElementRef>('scrollContainer');

  // --- Triggers ---
  private loadMore$ = new Subject<void>();

  // --- 1. The Source of Truth for API Criteria ---
  // We combine all inputs into one stream. If any changes, we get a new emission.
  private criteria$ = toObservable(
    computed(() => ({
      type: this.fetchType(),
      genre: this.genreId(),
      cType: this.contentType()
    }))
  );

  // --- 2. The Master Stream ---
  // The heart of the declarative logic
  readonly vm$: Observable<RowViewModel> = this.criteria$.pipe(
    // switchMap handles the RESET logic. 
    // If criteria changes (e.g. Action -> Comedy), the inner stream is killed and restarted.
    switchMap(criteria => {
      
      // Inner Stream: Handles Pagination for a specific criteria
      return this.loadMore$.pipe(
        // Start immediately
        startWith(void 0), 
        
        // Accumulate page numbers (1, 2, 3...)
        scan((page) => page + 1, 0),
        
        // Fetch Data: exhaustMap ignores scroll events while loading
        exhaustMap(page => 
           this.fetchData(criteria, page).pipe(
             map(response => ({ success: true, response, page })),
             startWith({ success: false, page }), // Loading start
             catchError(() => of({ success: true, response: { results: [], total_pages: 0 }, page })) // Handle error gracefully
           )
        ),

        // Accumulate Results (Like your Products example)
        scan((state: RowViewModel, emission: any): RowViewModel => {
          if (!emission.success) {
            return { ...state, isLoading: true };
          }
          
          const response = emission.response;
          return {
            items: [...state.items, ...response.results],
            isLoading: false,
            currentPage: emission.page,
            totalPages: response.total_pages || state.totalPages
          };
        }, INITIAL_STATE)
      );
    }),
    shareReplay(1)
  );

  // --- 3. Derived Observables for Template (Pure Declarative Style) ---
  
  readonly content$ = this.vm$.pipe(map(vm => vm.items));
  readonly isLoading$ = this.vm$.pipe(map(vm => vm.isLoading));

  // --- Actions ---

  onScroll() {
    // We can't be purely declarative with scroll UI events, so we bridge it here
    const element = this.scrollContainer().nativeElement;
    const atRightEdge = element.scrollLeft + element.clientWidth >= element.scrollWidth - 100;
    
    // Check "Has More" synchronously or via withLatestFrom if you want to be stricter
    if (atRightEdge) {
      this.loadMore$.next();
    }
  }

  navigateToDetail(item: Movie | TVShow): void {
     this.router.navigate([this.contentType() === CONTENT_TYPE.MOVIE ? '/movie' : '/tv', item.id]);
  }

  // --- API Helper (Pure Function Logic) ---
  private fetchData(criteria: any, page: number): Observable<any> {
    const { type, genre, cType } = criteria;
    const options = { page: page.toString(), with_genres: genre };
    
    // Safety check for max pages
    // (Note: In a pure stream, we'd filter this upstream, but this is a safe guard)
    if (page > 1 && page > 500) return of({ results: [], total_pages: 500 }); 

    if (cType === CONTENT_TYPE.MOVIE) {
      if (type === FETCH_TYPE.TRENDING) return this.tmdbService.getTrendingMovies();
      if (type === FETCH_TYPE.TOP_RATED) return this.tmdbService.getTopRatedMovies(page);
      if (type === FETCH_TYPE.GENRE && genre) return this.tmdbService.discoverMovies(options);
      return this.tmdbService.getPopularMovies(page);
    } else {
      if (type === FETCH_TYPE.TRENDING) return this.tmdbService.getTrendingTVShows();
      if (type === FETCH_TYPE.TOP_RATED) return this.tmdbService.getTopRatedTVShows(page);
      if (type === FETCH_TYPE.GENRE && genre) return this.tmdbService.discoverTVShows(options);
      return this.tmdbService.getPopularTVShows(page);
    }
  }

  // Helpers
  getTitle(item: any) { return item.title || item.name; }
  getDate(item: any) { return item.release_date || item.first_air_date; }
}