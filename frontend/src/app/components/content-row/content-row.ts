import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef,inject, input, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject,from,fromEvent,of } from 'rxjs';
import {map, scan, shareReplay,tap,concatMap, takeWhile, throttleTime } from 'rxjs/operators';
import { TmdbService } from '../../services/tmdb.service';
import { Movie, TMDBResponse, TVShow } from '../../models/tmdb.model';
import { FetchType } from '../../types/fetch-type.type';
import { FETCH_TYPE } from '../../constants/fetch-type.const';
import { ContentType } from '../../types/content-type.type';
import { CONTENT_TYPE } from '../../constants/content-type.const';
import { executeFetchStrategy } from '../../strategies/tmdb-fetch.strategy';
import { ContentCardComponent } from '../content-card/content-card';
import { SelectService } from '../../services/select-service';
import { ROUTES } from '../../constants/route.const';





@Component({
  selector: 'app-content-row',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  templateUrl: './content-row.html',
  styleUrl: "./content-row.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentRowComponent implements OnInit {
  // for test purpose
  lastRender(): string {
    return new Date().toLocaleTimeString();
  }
  // end lastRender

  private selectService = inject(SelectService);
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);


  constructor() {
    this.selectService.selectContent$
      .pipe(takeUntilDestroyed())
      .subscribe((item) => {
        this.navigateToDetail(item);
     }
    );
  }

  ngOnInit(): void {

    const element = this.scrollContainer().nativeElement;
    fromEvent(element, 'scroll')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log("scroll event in content row");
        const atRightEdge = element.scrollLeft + element.clientWidth >= element.scrollWidth - 100;
        if (atRightEdge) {
            this.page$.next(this.page$.getValue() + 1);
        }
      }
    );
      
  }

  // --- Inputs (Signals) ---
  title = input.required<string>();
  fetchType = input<FetchType>(FETCH_TYPE.TRENDING);
  genreId = input<string | undefined>(undefined);
  isLarge = input<boolean>(false);
  contentType = input<ContentType>(CONTENT_TYPE.MOVIE);
  scrollContainer = viewChild.required<ElementRef>('scrollContainer');

  // --- Triggers ---
  private page$ = new BehaviorSubject<number>(1);

  private MasterStream$ = this.page$.pipe(

    // debug tap
    tap((page) => console.log('Page Triggered:', page, "for", this.title())),
    //

    concatMap(page =>
      executeFetchStrategy(this.tmdbService, {
        type: this.fetchType(),
        cType: this.contentType(),
        genre: this.genreId()
      }, page)
    ),
    tap(response => console.log("Fetched Page:", response.page, "for", this.title(), "content", response.results.map(item => item.id))),
    scan((acc: TMDBResponse<Movie | TVShow>, curr: TMDBResponse<Movie | TVShow>) => {
      return {
        ...curr,
        results: [...acc.results, ...curr.results]
      };
    }, { results: [], page: 0, total_pages: 0, total_results: 0 } as TMDBResponse<Movie | TVShow>),

    // debug tap 
    tap(response => console.log("total pages:", response.total_pages, " | total results:", response.total_results, "title", this.title())),
    //
    takeWhile((response) => (response.page < response.total_pages) && this.title() != "Trending Now" , true), // temporary fix before adding the pagination
    shareReplay(1)
  );


  // Derived Observables for Template

  readonly content$ = this.MasterStream$.pipe(map(response => response.results));
  
  readonly isLoading$ = of(false);//this.MasterStream$.pipe(map(response => vm.isLoading));

  

  navigateToDetail(item: Movie | TVShow): void {
        this.router.navigate(
            ['/', this.contentType() === CONTENT_TYPE.MOVIE ? ROUTES.MOVIE : ROUTES.TV, item.id]
        );
  }


}