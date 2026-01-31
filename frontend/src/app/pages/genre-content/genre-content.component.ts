import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../../services/tmdb.service';
import { Observable, Subject, map, switchMap, scan, startWith, shareReplay, concatMap, takeWhile, take, BehaviorSubject, timer, zip, tap } from 'rxjs';
import { Movie, TVShow, TMDBResponse } from '../../models/tmdb.model';
import { MediaRowComponent } from '../../components/media-row/media-row.component';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CONTENT_TYPE } from '../../constants/content-type.const';
import { executeFetchStrategy } from '../../strategies/tmdb-fetch.strategy';
import { FETCH_TYPE } from '../../constants/fetch-type.const';
import { ContentType } from '../../types/content-type.type';

@Component({
  selector: 'app-genre-content',
  standalone: true,
  imports: [CommonModule, MediaRowComponent, NavbarComponent],
  templateUrl: './genre-content.component.html',
  styleUrl: './genre-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenreContentComponent {
  
    private route = inject(ActivatedRoute);
    private tmdbService = inject(TmdbService);
    protected  responseflag = new Subject();
    

    private contentType = CONTENT_TYPE;
    private genreFetchType = FETCH_TYPE.GENRE;

    protected type = this.route.snapshot.paramMap.get('type') ;
    private id = this.route.snapshot.paramMap.get('id');

    private page$ = new BehaviorSubject<number>(1);

    title = toSignal(this.route.queryParamMap.pipe(
        map(params => params.get('name') || 'Genre Content')
    ));

        
    private  response$ = this.page$.pipe(
        concatMap(page => {
        const criteria = {type: this.genreFetchType ,cType : this.type  as ContentType , genre :this.id || ""};
        return executeFetchStrategy(this.tmdbService, criteria, page);
        }),
        scan((acc, curr) => ({
            ...curr,
            results: [...acc.results, ...curr.results]
            }), { results: [], page: 0, total_pages: 0, total_results: 0 } as TMDBResponse<Movie | TVShow>),
        tap(() => this.responseflag.next(null)),
        takeWhile(response => response.results.length <= response.total_results, true),
        
        shareReplay(1)
    );
        
    loaded = toSignal(
        zip(this.responseflag, timer(2000)).pipe(map(() => true))
    )
            
            
    items$ = this.response$.pipe(map(response => response.results));
    hasMore$ = this.response$.pipe(map(response => response.page < response.total_pages));

    items = toSignal(this.items$, { initialValue: [] });

    loadMore() {
        this.page$.next(this.page$.value + 1);
    }
}