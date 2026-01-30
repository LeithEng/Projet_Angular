import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { TVShow } from '../../models/tmdb.model';
import { HeroBannerComponent } from "../../components/hero-banner/hero-banner";
import { ContentRowComponent } from '../../components/content-row/content-row';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { FETCH_TYPE } from '../../constants/fetch-type.const';
import { map, timer, zip } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TMDB_GENRES } from '../../constants/tmdb-genre.const';
import { CONTENT_TYPE } from '../../constants/content-type.const';

@Component({
  selector: 'app-tv-show',
  standalone: true,
  imports: [CommonModule, HeroBannerComponent, ContentRowComponent, NavbarComponent],
  templateUrl: './tv-show.component.html',
  styleUrl: "./tv-show.component.css"
})
export class TvShowComponent {

  protected readonly fetchTypes = FETCH_TYPE;
  protected readonly tvGenre = TMDB_GENRES.TV;
  protected readonly contentTypes = CONTENT_TYPE;

  private tmdbService: TmdbService = inject(TmdbService);

  bannerTvShow$ = zip(
      this.tmdbService.getTrendingTVShows(),
      timer(1000))
    .pipe(
    map(([response,_]) => response.results), 
    map(tvShows => tvShows[Math.floor(Math.random() * tvShows.length)])
  );

  bannerTvShow = toSignal(this.bannerTvShow$, { initialValue: null });

}
