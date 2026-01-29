import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { TVShow } from '../../models/tmdb.model';
import { HeroBannerComponent } from "../../components/hero-banner/hero-banner";
import { ContentRowComponent } from '../../components/content-row/content-row';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { FETCH_TYPE } from '../../constants/fetch-type.const';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tv-show',
  standalone: true,
  imports: [CommonModule, HeroBannerComponent, ContentRowComponent, NavbarComponent],
  templateUrl: './tv-show.component.html',
  styleUrl: "./tv-show.component.css"
})
export class TvShowComponent {;
  protected readonly fetchTypes = FETCH_TYPE;
  private tmdbService: TmdbService = inject(TmdbService);

  bannerTvShow$ = this.tmdbService.getTrendingTVShows().pipe(
    map(response => response.results), 
    map(tvShows => tvShows[Math.floor(Math.random() * tvShows.length)])
  );

  bannerTvShow = toSignal(this.bannerTvShow$, { initialValue: null });

}
