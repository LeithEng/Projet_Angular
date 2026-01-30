import {
  Component,
  OnInit,
  signal,
  ElementRef,
  ViewChild,
  HostListener,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Movie, TVShow } from '../../models/tmdb.model';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PosterUrlPipe } from '../../pipe/poster-url-pipe';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PosterUrlPipe],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  searchResults = signal<any[]>([]);
  isSearching = signal(false);
  showDropdown = signal(false);
  isExpanded = signal(false);

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isSearching.set(true)),
        switchMap((query) => {
          const term = query?.trim() || '';
          if (term.length < 2) {
            this.resetSearchState();
            return of({ results: [] });
          }
          return this.tmdbService.searchMulti(term, 1);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          const filtered = response.results.filter((item: any) => 
            this.isMovie(item) || this.isTVShow(item)
          );
          this.searchResults.set(filtered.slice(0, 8));
          this.showDropdown.set(this.searchResults().length > 0);
          this.isSearching.set(false);
        },
        error: (err) => {
          console.error('Search error:', err);
          this.isSearching.set(false);
        },
      });
  }

  private isMovie(item: any): boolean {
    return !!item.title;
  }

  private isTVShow(item: any): boolean {
    return !!item.name && item.first_air_date !== undefined;
  }

  private resetSearchState(): void {
    this.searchResults.set([]);
    this.showDropdown.set(false);
    this.isSearching.set(false);
  }

  toggleSearch(): void {
    this.isExpanded.update((v) => !v);
    if (this.isExpanded()) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 100);
    } else {
      this.clearSearch();
    }
  }

  selectMedia(media: any): void {
    if (this.isTVShow(media)) {
      this.router.navigate(['/tv', media.id]);
    } else {
      this.router.navigate(['/movie', media.id]);
    }
    this.clearSearch();
  }

  viewAllResults(): void {
    const query = this.searchControl.value?.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.clearSearch();
    }
  }

  onEnterKey(event: Event): void {
    event.preventDefault();
    const query = this.searchControl.value?.trim();
    if (query && query.length >= 2) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.resetSearchState();
    this.isExpanded.set(false);
  }

  getYear(dateString: string): string {
    return dateString ? new Date(dateString).getFullYear().toString() : '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showDropdown.set(false);
    }
  }
}
